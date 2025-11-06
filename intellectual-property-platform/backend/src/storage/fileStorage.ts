import fs from 'fs';
import path from 'path';
import {
  User,
  Asset,
  InfringementCase,
  RightsProtection,
  License,
  Device,
} from '../types';

const DATA_DIR = path.join(__dirname, '../../data');

// 确保数据目录存在
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

class FileStorage {
  private usersFile = path.join(DATA_DIR, 'users.json');
  private assetsFile = path.join(DATA_DIR, 'assets.json');
  private infringementsFile = path.join(DATA_DIR, 'infringements.json');
  private rightsProtectionsFile = path.join(DATA_DIR, 'rightsProtections.json');
  private licensesFile = path.join(DATA_DIR, 'licenses.json');
  private devicesFile = path.join(DATA_DIR, 'devices.json');

  // Users
  getUsers(): User[] {
    if (!fs.existsSync(this.usersFile)) return [];
    return JSON.parse(fs.readFileSync(this.usersFile, 'utf-8'));
  }

  saveUsers(users: User[]): void {
    fs.writeFileSync(this.usersFile, JSON.stringify(users, null, 2));
  }

  // Assets
  getAssets(): Asset[] {
    if (!fs.existsSync(this.assetsFile)) return [];
    return JSON.parse(fs.readFileSync(this.assetsFile, 'utf-8'));
  }

  saveAssets(assets: Asset[]): void {
    fs.writeFileSync(this.assetsFile, JSON.stringify(assets, null, 2));
  }

  // Infringements
  getInfringements(): InfringementCase[] {
    if (!fs.existsSync(this.infringementsFile)) return [];
    return JSON.parse(fs.readFileSync(this.infringementsFile, 'utf-8'));
  }

  saveInfringements(infringements: InfringementCase[]): void {
    fs.writeFileSync(this.infringementsFile, JSON.stringify(infringements, null, 2));
  }

  // Rights Protections
  getRightsProtections(): RightsProtection[] {
    if (!fs.existsSync(this.rightsProtectionsFile)) return [];
    return JSON.parse(fs.readFileSync(this.rightsProtectionsFile, 'utf-8'));
  }

  saveRightsProtections(protections: RightsProtection[]): void {
    fs.writeFileSync(this.rightsProtectionsFile, JSON.stringify(protections, null, 2));
  }

  // Licenses
  getLicenses(): License[] {
    if (!fs.existsSync(this.licensesFile)) return [];
    return JSON.parse(fs.readFileSync(this.licensesFile, 'utf-8'));
  }

  saveLicenses(licenses: License[]): void {
    fs.writeFileSync(this.licensesFile, JSON.stringify(licenses, null, 2));
  }

  // Devices
  getDevices(): Device[] {
    if (!fs.existsSync(this.devicesFile)) return [];
    return JSON.parse(fs.readFileSync(this.devicesFile, 'utf-8'));
  }

  saveDevices(devices: Device[]): void {
    fs.writeFileSync(this.devicesFile, JSON.stringify(devices, null, 2));
  }
}

export default new FileStorage();

