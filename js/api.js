// Duomenų sluoksnis. Jei config.js užpildytas – naudojama Supabase duomenų bazė,
// jei ne – demonstracinis režimas (duomenys saugomi tik šioje naršyklėje).
import { SUPABASE_URL, SUPABASE_ANON_KEY } from './config.js?v=10';

export const DEMO = !SUPABASE_URL || !SUPABASE_ANON_KEY;

const OWNER = 'owner:profiles!pets_owner_id_fkey(id,name,role,shelter_name,verified,city,banned,avatar_url)';
const PET_SELECT = `*, ${OWNER}`;
const REQ_SELECT = `*, pet:pets(${PET_SELECT}), seeker:profiles!requests_seeker_id_fkey(id,name,city,avatar_url)`;

import { compressImage } from './image.js?v=10';
export { compressImage };

function check({ data, error }) {
  if (error) throw new Error(error.message);
  return data;
}

async function createSupabaseApi() {
  const { createClient } = await import('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.100.0/+esm');
  const sb = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  let user = null;
  const listeners = new Set();
  let recoveryCb = null;
  const emit = () => listeners.forEach(f => f(user));

  async function loadProfile(session) {
    if (!session) { user = null; return; }
    const { data } = await sb.from('profiles').select('*').eq('id', session.user.id).maybeSingle();
    user = { ...(data || { id: session.user.id, name: '', role: 'user' }), email: session.user.email };
  }

  const api = {
    get user() { return user; },
    async init() {
      const { data } = await sb.auth.getSession();
      await loadProfile(data.session);
      sb.auth.onAuthStateChange(async (event, session) => {
        if (event === 'PASSWORD_RECOVERY') { await loadProfile(session); recoveryCb?.(); return; }
        const before = user?.id;
        await loadProfile(session);
        if (before !== user?.id) emit();
      });
    },
    onChange(f) { listeners.add(f); },
    onRecovery(f) { recoveryCb = f; },
    async reloadUser() { const { data } = await sb.auth.getSession(); await loadProfile(data.session); return user; },

    // ---------- Paskyra ----------
    async signUp({ email, password, name, city, birth_date }) {
      const data = check(await sb.auth.signUp({ email, password, options: { data: { name, city, birth_date }, emailRedirectTo: location.origin + location.pathname } }));
      if (!data.session) return { needsConfirm: true };
      await loadProfile(data.session); emit();
      return { needsConfirm: false };
    },
    async signIn(email, password) {
      const data = check(await sb.auth.signInWithPassword({ email, password }));
      await loadProfile(data.session); emit();
    },
    async signInWith(provider) {
      check(await sb.auth.signInWithOAuth({ provider, options: { redirectTo: location.origin + location.pathname } }));
    },
    async completeProfile({ birth_date, city, name }) {
      check(await sb.rpc('complete_profile', { p_birth: birth_date, p_city: city, p_name: name }));
      user = { ...user, onboarded: true, city: city || user.city, name: name || user.name };
    },
    async myBirthDate() { return (await sb.from('profile_private').select('birth_date').eq('id', user.id).maybeSingle()).data?.birth_date || ''; },
    async uploadAvatar(file) {
      const blob = await compressImage(file, 400, 0.85);
      const path = `${user.id}/${Date.now()}.jpg`;
      check(await sb.storage.from('avatars').upload(path, blob, { contentType: 'image/jpeg' }));
      const url = sb.storage.from('avatars').getPublicUrl(path).data.publicUrl;
      return api.updateProfile({ avatar_url: url });
    },
    async signOut() { await sb.auth.signOut(); user = null; emit(); },
    async resetPassword(email) {
      check(await sb.auth.resetPasswordForEmail(email, { redirectTo: location.origin + location.pathname }));
    },
    async updatePassword(password) { check(await sb.auth.updateUser({ password })); },
    async updateEmail(email) { check(await sb.auth.updateUser({ email }, { emailRedirectTo: location.origin + location.pathname })); },
    async updateProfile(patch) {
      const data = check(await sb.from('profiles').update(patch).eq('id', user.id).select().single());
      user = { ...user, ...data };
      return user;
    },
    async deleteAccount() { check(await sb.rpc('delete_user')); await sb.auth.signOut(); user = null; emit(); },
    async getProfile(id) { return check(await sb.from('profiles').select('id,name,role,shelter_name,verified,city,phone,website,address,about,avatar_url').eq('id', id).maybeSingle()); },

    // ---------- Gyvūnai ----------
    async listPets() {
      return check(await sb.from('pets').select(PET_SELECT).eq('hidden', false).eq('archived', false).eq('review_status', 'ok').not('owner_id', 'is', null).order('created_at', { ascending: false }));
    },
    async petsByOwner(uid) {
      return check(await sb.from('pets').select(PET_SELECT).eq('owner_id', uid).eq('hidden', false).eq('archived', false).eq('review_status', 'ok').order('created_at', { ascending: false }));
    },
    async getPet(id) { return check(await sb.from('pets').select(PET_SELECT).eq('id', id).maybeSingle()); },
    async myPets() { return check(await sb.from('pets').select(PET_SELECT).eq('owner_id', user.id).order('created_at', { ascending: false })); },
    async createPet(d) { return check(await sb.from('pets').insert({ ...d, owner_id: user.id }).select(PET_SELECT).single()); },
    async updatePet(id, d) { return check(await sb.from('pets').update(d).eq('id', id).select(PET_SELECT).single()); },
    async deletePet(id) { check(await sb.from('pets').delete().eq('id', id)); },
    async uploadPhoto(file) {
      const blob = await compressImage(file);
      const path = `${user.id}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.jpg`;
      check(await sb.storage.from('pet-photos').upload(path, blob, { contentType: 'image/jpeg' }));
      return sb.storage.from('pet-photos').getPublicUrl(path).data.publicUrl;
    },

    // ---------- Išsaugoti ----------
    async favoriteIds() {
      if (!user) return new Set();
      return new Set(check(await sb.from('favorites').select('pet_id').eq('user_id', user.id)).map(r => r.pet_id));
    },
    async setFavorite(petId, on) {
      if (on) check(await sb.from('favorites').upsert({ user_id: user.id, pet_id: petId }));
      else check(await sb.from('favorites').delete().eq('user_id', user.id).eq('pet_id', petId));
    },

    // ---------- Užklausos ir žinutės ----------
    async createRequest(d) { return check(await sb.from('requests').insert({ ...d, seeker_id: user.id }).select(REQ_SELECT).single()); },
    async myRequests() { return check(await sb.from('requests').select(REQ_SELECT).eq('seeker_id', user.id).order('created_at', { ascending: false })); },
    async incomingRequests() {
      return check(await sb.from('requests').select(`*, pet:pets!inner(${PET_SELECT}), seeker:profiles!requests_seeker_id_fkey(id,name,city,avatar_url)`)
        .eq('pet.owner_id', user.id).order('created_at', { ascending: true }));
    },
    async getRequest(id) { return check(await sb.from('requests').select(REQ_SELECT).eq('id', id).maybeSingle()); },
    async updateRequest(id, patch) { return check(await sb.from('requests').update(patch).eq('id', id).select(REQ_SELECT).single()); },
    async markRead(req) {
      const field = req.seeker_id === user.id ? 'seeker_read_at' : 'owner_read_at';
      await sb.from('requests').update({ [field]: new Date().toISOString() }).eq('id', req.id);
    },
    async listMessages(rid) { return check(await sb.from('messages').select('*').eq('request_id', rid).order('created_at')); },
    async sendMessage(rid, body, kind = 'text') {
      return check(await sb.from('messages').insert({ request_id: rid, sender_id: user.id, body, kind }).select().single());
    },
    async lastMessages(ids) {
      if (!ids.length) return {};
      const out = {};
      check(await sb.from('messages').select('*').in('request_id', ids).order('created_at')).forEach(m => { out[m.request_id] = m; });
      return out;
    },

    // ---------- Pranešimai ----------
    async createReport(petId, reason, details) { check(await sb.from('reports').insert({ pet_id: petId, reporter_id: user.id, reason, details })); },
    async listReports() { return check(await sb.from('reports').select(`*, pet:pets(${PET_SELECT})`).order('created_at', { ascending: false })); },
    async resolveReport(report, status) {
      if (status === 'Pašalinta') check(await sb.from('pets').update({ hidden: true }).eq('id', report.pet_id));
      check(await sb.from('reports').update({ status }).eq('pet_id', report.pet_id).eq('status', 'Nauja'));
      check(await sb.from('reports').update({ status }).eq('id', report.id));
    },

    // ---------- Prieglaudų paraiškos ----------
    async myApplication() {
      return check(await sb.from('shelter_applications').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(1).maybeSingle());
    },
    async submitApplication(d, files) {
      const docs = [];
      for (const f of files) {
        const path = `${user.id}/${Date.now()}-${f.name.replace(/[^\w.\-]+/g, '_')}`;
        check(await sb.storage.from('shelter-docs').upload(path, f, { contentType: f.type || 'application/octet-stream' }));
        docs.push(path);
      }
      return check(await sb.from('shelter_applications').insert({ ...d, docs, user_id: user.id }).select().single());
    },
    async listApplications() {
      return check(await sb.from('shelter_applications').select('*, user:profiles(id,name,avatar_url)').order('created_at', { ascending: false }));
    },
    async docUrl(path) { return check(await sb.storage.from('shelter-docs').createSignedUrl(path, 600)).signedUrl; },
    async decideApplication(id, approve, note) { check(await sb.rpc('approve_application', { app_id: id, approve, note })); },

    // ---------- Administravimas ----------
    async adminUsers() { return check(await sb.rpc('admin_users')); },
    async adminSetUser(id, patch) { check(await sb.from('profiles').update(patch).eq('id', id)); },
    async adminDeleteUser(id) { check(await sb.rpc('delete_user', { uid: id })); },
    async adminAllPets() { return check(await sb.from('pets').select(PET_SELECT).order('created_at', { ascending: false })); },
    async adminHideUserPets(id, hidden) { check(await sb.from('pets').update({ hidden }).eq('owner_id', id)); },
  };
  return api;
}

export const api = DEMO ? (await import('./demo.js?v=10')).createDemoApi() : await createSupabaseApi();
