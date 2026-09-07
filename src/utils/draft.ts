import type { Round } from '../types';
const key=(id:string)=>`happy-golf-v4-draft-${id}`;
const prefix='happy-golf-v4-draft-';
export function saveDraft(round:Round){try{localStorage.setItem(key(round.id),JSON.stringify({...round,updatedAt:Date.now()}));}catch(e){console.warn('draft save failed',e)}}
export function removeDraft(id:string){try{localStorage.removeItem(key(id));}catch{}}
export function loadDrafts():Round[]{try{return Object.keys(localStorage).filter(k=>k.startsWith(prefix)).map(k=>JSON.parse(localStorage.getItem(k)||'null')).filter(Boolean).sort((a,b)=>(b.updatedAt||0)-(a.updatedAt||0));}catch{return []}}
