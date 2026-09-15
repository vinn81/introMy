const crypto = require("node:crypto");
const {
  generateRegistrationOptions,
  verifyRegistrationResponse,
  generateAuthenticationOptions,
  verifyAuthenticationResponse,
} = require("@simplewebauthn/server");
const { query } = require("./db");
const { config, expectedOrigins } = require("./auth");

const challengeId = () => crypto.randomUUID();
const randomChallenge = () => crypto.randomBytes(32).toString("base64url");
const publicKeyToText = (value) => Buffer.from(value).toString("base64url");
const publicKeyFromText = (value) => Buffer.from(value, "base64url");
const logChallenge = (purpose, challenge) => console.info(`AUTH_CHALLENGE created type=${purpose} id=${crypto.createHash("sha256").update(challenge).digest("hex").slice(0, 12)}`);

async function userById(userId) {
  const rows = await query`SELECT id, display_name FROM users WHERE id = ${userId}`;
  return rows[0];
}

async function credentialsByUser(userId) {
  return query`SELECT credential_id, user_id, public_key, counter, transports, name, created_at FROM credentials WHERE user_id = ${userId} ORDER BY created_at ASC`;
}

async function credentialById(credentialId) {
  const rows = await query`SELECT * FROM credentials WHERE credential_id = ${credentialId}`;
  return rows[0];
}

async function issueChallenge(purpose, userId) {
  const id = challengeId();
  const challenge = randomChallenge();
  await query`UPDATE challenges SET used = TRUE WHERE used = TRUE OR expires_at < NOW()`;
  await query`INSERT INTO challenges (id, challenge, purpose, user_id, expires_at) VALUES (${id}, ${challenge}, ${purpose}, ${userId}, NOW() + INTERVAL '5 minutes')`;
  logChallenge(purpose, challenge);
  return { id, challenge };
}

async function consumeChallenge(id, purpose, userId) {
  const rows = await query`UPDATE challenges SET used = TRUE WHERE id = ${id} AND purpose = ${purpose} AND user_id = ${userId} AND used = FALSE AND expires_at > NOW() RETURNING challenge`;
  if (!rows.length) {
    console.warn("AUTH_CHALLENGE rejected reason=invalid_expired_or_already_used");
    return null;
  }
  return rows[0].challenge;
}

function requestTestUser(req) {
  if (process.env.TEST_MODE !== "true") return null;
  const value = req.headers["x-test-user"];
  return value === "owner-test" || value === "other-test" ? value : null;
}

async function registrationOptions(userId, existingCredentials) {
  const challenge = await issueChallenge("registration", userId);
  const settings = config();
  const options = await generateRegistrationOptions({
    rpName: settings.rpName,
    rpID: settings.rpID,
    userName: userId,
    userDisplayName: (await userById(userId)).display_name,
    userID: Buffer.from(userId),
    challenge: challenge.challenge,
    timeout: 60000,
    attestationType: "none",
    excludeCredentials: existingCredentials.map((credential) => ({ id: credential.credential_id, transports: credential.transports || [] })),
    authenticatorSelection: { residentKey: "preferred", userVerification: "required" },
  });
  return { ...options, challengeId: challenge.id };
}

async function verifyRegistration(response, challenge, userId, name) {
  const verification = await verifyRegistrationResponse({
    response,
    expectedChallenge: challenge,
    expectedOrigin: expectedOrigins(),
    expectedRPID: config().rpID,
    requireUserVerification: true,
  });
  if (!verification.verified || !verification.registrationInfo) return null;
  const { credential, credentialDeviceType, credentialBackedUp } = verification.registrationInfo;
  await query`INSERT INTO credentials (credential_id, user_id, public_key, counter, transports, name) VALUES (${credential.id}, ${userId}, ${publicKeyToText(credential.publicKey)}, ${credential.counter}, ${JSON.stringify(credential.transports || [])}::jsonb, ${name})`;
  return { credentialDeviceType, credentialBackedUp };
}

async function authenticationOptions(userId) {
  const credentials = await credentialsByUser(userId);
  const challenge = await issueChallenge("authentication", userId);
  const options = await generateAuthenticationOptions({
    rpID: config().rpID,
    challenge: challenge.challenge,
    timeout: 60000,
    allowCredentials: credentials.map((credential) => ({ id: credential.credential_id, transports: credential.transports || [] })),
    userVerification: "required",
  });
  return { ...options, challengeId: challenge.id };
}

async function verifyAuthentication(response, challenge, credential) {
  const verification = await verifyAuthenticationResponse({
    response,
    expectedChallenge: challenge,
    expectedOrigin: expectedOrigins(),
    expectedRPID: config().rpID,
    credential: {
      id: credential.credential_id,
      publicKey: publicKeyFromText(credential.public_key),
      counter: Number(credential.counter),
      transports: credential.transports || [],
    },
    requireUserVerification: true,
  });
  if (!verification.verified) return false;
  await query`UPDATE credentials SET counter = ${verification.authenticationInfo.newCounter} WHERE credential_id = ${credential.credential_id}`;
  return true;
}

module.exports = {
  authenticationOptions,
  credentialById,
  credentialsByUser,
  consumeChallenge,
  requestTestUser,
  registrationOptions,
  userById,
  verifyAuthentication,
  verifyRegistration,
};
