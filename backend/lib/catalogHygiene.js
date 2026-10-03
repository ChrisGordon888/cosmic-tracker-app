function validateAudioIdentity(input) {
 if (input.audioContentHash != null && !/^[a-f0-9]{64}$/.test(input.audioContentHash)) throw new Error('Audio content hash must be a lowercase SHA-256 digest.');
 if (input.sourceFileSize != null && (!Number.isSafeInteger(input.sourceFileSize) || input.sourceFileSize < 0)) throw new Error('Source file size must be a nonnegative safe integer.');
 if (input.sourceFileName != null && (typeof input.sourceFileName !== 'string' || input.sourceFileName.length > 512 || /[\x00-\x1f]/.test(input.sourceFileName))) throw new Error('Invalid source filename.');
}
function archiveBlockReason(release,{profileReference=false,trackPublication=false,editorialReference=false,collectionReference=false}={}) {
 if(release.visibility!=='private'||release.status==='released')return 'Unpublish this release through the existing publishing workflow before archiving.';
 if(release.isFeatured||profileReference)return 'Choose another featured release before archiving.';
 if(trackPublication||editorialReference||collectionReference)return 'Resolve Nexus review, editorial and active collection references before archiving.';
 return null;
}
module.exports={validateAudioIdentity,archiveBlockReason};
