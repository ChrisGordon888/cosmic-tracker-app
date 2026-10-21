// Bounded sampled spectra: 64 ms Hann windows every 250 ms, up to 10 minutes.
// Power is combined across channels so antiphase stereo cannot cancel.
export function perceivePCM(channels:Float32Array[],rate:number){
 const n=1024,hop=Math.round(rate/4);let weighted=0,energy=0,high=0,frames=0;
 for(let start=0;start+n<=channels[0].length;start+=hop){
  let framePower=0;
  for(const channel of channels){
   const re=new Float64Array(n),im=new Float64Array(n);
   for(let i=0;i<n;i++)re[i]=channel[start+i]*(.5-.5*Math.cos(2*Math.PI*i/(n-1)));
   for(let i=1,j=0;i<n;i++){let bit=n>>1;for(;j&bit;bit>>=1)j^=bit;j^=bit;if(i<j){const t=re[i];re[i]=re[j];re[j]=t;}}
   for(let size=2;size<=n;size*=2){const angle=-2*Math.PI/size;for(let base=0;base<n;base+=size)for(let j=0;j<size/2;j++){const c=Math.cos(angle*j),s=Math.sin(angle*j),a=base+j,b=a+size/2,tr=c*re[b]-s*im[b],ti=s*re[b]+c*im[b];re[b]=re[a]-tr;im[b]=im[a]-ti;re[a]+=tr;im[a]+=ti;}}
   for(let k=1;k<=n/2;k++){const p=(re[k]*re[k]+im[k]*im[k])/channels.length,f=k*rate/n;framePower+=p;energy+=p;weighted+=p*f;if(f>=2000)high+=p;}
  }
  if(framePower>1e-6)frames++;
 }
 const size=Math.round(rate/10),levels:number[]=[];
 for(let start=0;start+size<=channels[0].length;start+=size){let p=0;for(const c of channels)for(let i=start;i<start+size;i++)p+=c[i]*c[i]/channels.length;levels.push(10*Math.log10(Math.max(1e-12,p/size)));}
 let rises=0;for(let i=1;i<levels.length;i++)if(levels[i]>-60&&levels[i]-levels[i-1]>=6)rises++;
 return {spectralCentroidHz:frames?weighted/energy:null,highBandRatio:frames?high/energy:null,activityRisesPerSecond:levels.length>=10?rises/(levels.length/10):null,spectralFrames:frames};
}
export type PerceptionSummary={spectralCentroidHz?:number|null;highBandRatio?:number|null;activityRisesPerSecond?:number|null;spectralFrames?:number};
export function comparePerception(a:PerceptionSummary,b:PerceptionSummary){
 const observations:string[]=[];
 if(a.highBandRatio!=null&&b.highBandRatio!=null){const difference=(b.highBandRatio-a.highBandRatio)*100;if(Math.abs(difference)>=10)observations.push(`The second recording has ${Math.abs(difference).toFixed(0)} percentage points ${difference>0?'more':'less'} sampled spectral energy above 2 kHz. Audition the contrast; this is not a judgment of tone or quality.`);}
 if(a.activityRisesPerSecond!=null&&b.activityRisesPerSecond!=null){const difference=b.activityRisesPerSecond-a.activityRisesPerSecond;if(Math.abs(difference)>=.5)observations.push(`The second recording has ${Math.abs(difference).toFixed(1)} ${difference>0?'more':'fewer'} abrupt amplitude rises per second. These can include transients or edits; they are not detected beats or tempo.`);}
 return observations;
}
