import {
  clearSiteTeamPhotoRecord,
  findSiteTeamPhotoRecord,
  markSiteWidgetInstallVerifiedRecord,
  updateSiteTeamPhotoRecord
} from "@/lib/repositories/sites-repository";
import { deleteR2Object, uploadSiteTeamPhotoToR2 } from "@/lib/r2";
import { optionalText } from "@/lib/utils";
import { getWorkspaceOwnerId, loadOwnedSite } from "./sites-shared";

export async function updateSiteTeamPhoto(
  siteId: string,
  userId: string,
  input: { fileName: string; contentType: string; content: Buffer }
) {
  const ownerUserId = await getWorkspaceOwnerId(userId);
  const current = await findSiteTeamPhotoRecord(siteId, ownerUserId);
  if (!current) {
    return null;
  }

  const uploaded = await uploadSiteTeamPhotoToR2({
    siteId,
    fileName: input.fileName,
    contentType: input.contentType,
    content: input.content
  });

  const updated = await updateSiteTeamPhotoRecord(siteId, ownerUserId, uploaded.url, uploaded.key);
  if (!updated) {
    return null;
  }

  if (current.team_photo_key && current.team_photo_key !== uploaded.key) {
    await deleteR2Object(current.team_photo_key).catch(() => {});
  }

  return loadOwnedSite(siteId, ownerUserId);
}

export async function removeSiteTeamPhoto(siteId: string, userId: string) {
  const ownerUserId = await getWorkspaceOwnerId(userId);
  const current = await findSiteTeamPhotoRecord(siteId, ownerUserId);
  if (!current) {
    return null;
  }

  const cleared = await clearSiteTeamPhotoRecord(siteId, ownerUserId);
  if (!cleared) {
    return null;
  }

  if (current.team_photo_key) {
    await deleteR2Object(current.team_photo_key).catch(() => {});
  }

  return loadOwnedSite(siteId, ownerUserId);
}

export async function markSiteWidgetInstallVerified(siteId: string, userId: string, verifiedUrl: string | null = null) {
  const ownerUserId = await getWorkspaceOwnerId(userId);
  const marked = await markSiteWidgetInstallVerifiedRecord(siteId, ownerUserId, optionalText(verifiedUrl));
  return marked ? loadOwnedSite(siteId, ownerUserId) : null;
}
