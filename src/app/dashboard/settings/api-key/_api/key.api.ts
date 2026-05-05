import { keyService } from "../_services/key.service";

export const keyApi = {
  async addKey(provider: string, key: string) {
    return await keyService.add(provider, key);
  },

  async removeKey(provider: string, key: string) {
    return await keyService.remove(provider, key);
  },

  async getProviders() {
    return await keyService.getProviders();
  },

  async getKeys(provider: string) {
    return await keyService.getKeys(provider);
  },

  async getAll() {
    return await keyService.load();
  },

  async checkKey(provider: string, key: string) {
    return await keyService.load().then(() => true);
  },

};