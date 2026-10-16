// Para añadir lugares, copia un objeto y cambia sus datos.
// Incluye solo planes gratuitos que hayas comprobado.
const plans = [
  {id:1,title:'Paseo por El Retiro',city:'Madrid',category:'Naturaleza',place:'Parque de El Retiro',description:'Disfruta de sus jardines, caminos y estanque desde los espacios públicos.',emoji:'🌳'},
  {id:2,title:'Paseo por el entorno del Park Güell',city:'Barcelona',category:'Cultura',place:'Calles del entorno del Park Güell',description:'Explora el barrio y sus vistas. La zona monumental del parque requiere entrada.',emoji:'🏛️'},
  {id:3,title:'Tarde en la Malagueta',city:'Málaga',category:'Naturaleza',place:'Playa de la Malagueta',description:'Pasea junto al mar o disfruta de la playa pública.',emoji:'🏖️'},
  {id:4,title:'Descubre la Plaza de España',city:'Sevilla',category:'Cultura',place:'Plaza de España',description:'Contempla su arquitectura y los azulejos de las provincias.',emoji:'✨'},
  {id:5,title:'Ruta por el Jardín del Turia',city:'Valencia',category:'Deporte',place:'Jardín del Turia',description:'Recorre a pie los senderos y zonas verdes de este parque urbano.',emoji:'🚲'},
  {id:6,title:'Paseo por la playa de la Fontanilla',city:'Marbella',category:'Naturaleza',place:'Playa de la Fontanilla',description:'Un paseo al aire libre junto a la costa.',emoji:'🌊'}
];
const $ = id => document.getElementById(id);
const saved = (()=>{try{return JSON.parse(localStorage.getItem('planazo-favorites')||'[]')}catch{return []}})();
const favorites = new Set(Array.isArray(saved)?saved:[]);
const unique = field => [...new Set(plans.map(p=>p[field]))].sort((a,b)=>a.localeCompare(b,'es'));
for(const field of ['city','category'])for(const value of unique(field)){const opt=document.createElement('option');opt.value=value;opt.textContent=value;$(field).append(opt)}
function render(){
 const q=$('search').value.trim().toLocaleLowerCase('es');
 const filtered=plans.filter(p=>(!$('city').value||p.city===$('city').value)&&(!$('category').value||p.category===$('category').value)&&(!$('onlyFavorites').checked||favorites.has(p.id))&&[p.title,p.city,p.category,p.place,p.description].some(s=>s.toLocaleLowerCase('es').includes(q)));
 $('count').textContent=`${filtered.length} ${filtered.length===1?'plan':'planes'}`;
 $('empty').hidden=filtered.length!==0;
 $('cards').replaceChildren(...filtered.map(p=>{
  const card=document.createElement('article');card.className='card';
  const top=document.createElement('div');top.className='card-top';
  const emoji=document.createElement('span');emoji.className='emoji';emoji.textContent=p.emoji;
  const heart=document.createElement('button');heart.className='heart';heart.type='button';heart.textContent=favorites.has(p.id)?'♥':'♡';heart.setAttribute('aria-label',`${favorites.has(p.id)?'Quitar de':'Añadir a'} favoritos: ${p.title}`);heart.setAttribute('aria-pressed',String(favorites.has(p.id)));
  heart.addEventListener('click',()=>{favorites.has(p.id)?favorites.delete(p.id):favorites.add(p.id);try{localStorage.setItem('planazo-favorites',JSON.stringify([...favorites]))}catch{}render()});
  top.append(emoji,heart);
  const title=document.createElement('h3');title.textContent=p.title;
  const desc=document.createElement('p');desc.textContent=p.description;
  const meta=document.createElement('p');meta.className='meta';meta.textContent=`📍 ${p.city} · ${p.place}`;
  const bottom=document.createElement('div');bottom.className='card-bottom';
  const tag=document.createElement('span');tag.className='tag';tag.textContent=p.category;
  const free=document.createElement('span');free.className='free';free.textContent='GRATIS';
  bottom.append(tag,free);card.append(top,title,desc,meta,bottom);return card;
 }));
}
for(const id of ['search','city','category','onlyFavorites'])$(id).addEventListener(id==='search'?'input':'change',render);
render();
