const choices = ['canon', 'listed', 'private', 'sandbox'];
// Null/missing is unreviewed legacy exposure, never an affirmative Canon selection.
function curationUpdate(track, choice) {
 if (!choices.includes(choice)) throw new Error('Choose Canon, Listed, Private or Sandbox.');
 if (['canon','listed'].includes(choice) && (track.status === 'archived' || ['vault','test'].includes(track.catalogTreatment))) throw new Error('Restore this track to Current before making it shareable.');
 return { publicCanon: choice === 'canon', visibility: choice === 'canon' ? 'public' : choice === 'listed' ? 'listed' : 'private', isPublic: choice === 'canon', ...(choice === 'sandbox' ? {catalogTreatment:'test'} : {}), ...(choice === 'canon' ? {} : {showInNexus:false,nexusReviewStatus:'draft'}) };
}
module.exports = { choices, curationUpdate, discoveryFilter: {publicCanon:{$ne:false}} };
