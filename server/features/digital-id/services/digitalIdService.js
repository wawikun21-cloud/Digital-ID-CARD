import {
  findOneByUserId,
  upsertForUser,
  resetToSeedForUser,
  getAllDigitalIds as modelGetAllDigitalIds,
  getSeedRecord,
} from '../models/digitalIdModel.js';

export async function getDigitalId(userId) {
  let record = await findOneByUserId(userId);
  if (!record) {
    record = await createSeedForUser(userId);
  }
  return record;
}

async function createSeedForUser(userId) {
  return upsertForUser(userId, {
    name: '',
    position: '',
    secondary_role: '',
    department: '',
    organization: '',
    bio: '',
    contact_phone: '',
    contact_website: '',
    contact_email: '',
    issued: '',
    expires: '',
    social_links: [],
  }, null, null, null);
}

export async function saveDigitalId(userId, data, photoBuffer = null) {
  return upsertForUser(userId, data, photoBuffer, null, null);
}

export async function saveDigitalIdForUser(userId, data, photoBuffer = null, backgroundBuffer = null, logoBuffer = null) {
  return upsertForUser(userId, data, photoBuffer, backgroundBuffer, logoBuffer);
}

export async function deleteDigitalId(userId) {
  await resetToSeedForUser(userId);
}

export async function deleteDigitalIdByUserId(userId) {
  await resetToSeedForUser(userId);
}

export async function getAllDigitalIds() {
  return modelGetAllDigitalIds();
}

export async function getDigitalIdByUserId(userId) {
  return findOneByUserId(userId);
}

export function seedRecord() {
  return getSeedRecord();
}