import { DAO } from './DAO.ts';
import { DistrictDao } from './DistrictDao.ts';
import { DistrictRepository } from './DistrictRepository.ts';
import { StationDao } from './StationDao.ts';
import { StationRepository } from './StationRepository.ts';

const stationDao = new StationDao();
const districtDao = new DistrictDao();
const stationRepository = new StationRepository();
const districtRepository = new DistrictRepository();

console.log('findAll:', (await stationDao.findAll()).length);
console.log('getName(1):', await stationDao.getName(1));
console.log('listByIdRange(1, 5):', await stationDao.listByIdRange(1, 5));
console.log('findByNameLike("Пл"):', (await stationDao.findByNameLike('Пл')).map((s) => s.name));

console.log('search("Пл", null, null):', (await stationDao.search('Пл', null, null)).length);
console.log('search(null, 16, 18):', (await stationDao.search(null, 16, 18)).length);
console.log('search("Пл", 10, null):', (await stationDao.search('Пл', 10, null)).length);

const district = await districtDao.get(1);
const before = (await stationDao.findByDistrict(1)).length;
await DAO.begin();
const first = await stationDao.save({ districtId: 1, name: `Станция ПЗ5 А ${Date.now()}`, address: 'ул. Ленина, 5', capacity: 10, latitude: '55.750000', longitude: '37.600000', openedOn: '2026-11-05' });
const second = await stationDao.save({ districtId: 1, name: `Станция ПЗ5 Б ${Date.now()}`, address: 'ул. Ленина, 6', capacity: 12, latitude: '55.750000', longitude: '37.600000', openedOn: '2026-11-05' });
await DAO.commit();
console.log(`district ${district?.name}: stations ${before} -> ${(await stationDao.findByDistrict(1)).length}`);
console.log('via relation:', (await districtDao.getWithStations(1))?.stations.length);
await DAO.begin();
await stationDao.delete(first.id);
await stationDao.delete(second.id);
await DAO.commit();
console.log('after delete:', (await stationDao.findByDistrict(1)).length);

console.log('repository findAll:', (await stationRepository.findAll()).length);
console.log('repository findById(1):', (await stationRepository.findById(1))?.name);
console.log('districts:', (await districtRepository.findAll()).length);
const saved = await stationRepository.save({ districtId: 1, name: `Станция ПЗ5 В ${Date.now()}`, address: 'ул. Ленина, 7', capacity: 8, latitude: '55.750000', longitude: '37.600000', openedOn: '2026-11-05' });
console.log('saved id:', saved.id);
await stationRepository.deleteById(saved.id);
console.log('findByNameStartingWithIgnoreCase("пл"):', (await stationRepository.findByNameStartingWithIgnoreCase('пл')).length);
console.log(`findStationsByDistrictName("${district?.name}"):`, (await stationRepository.findStationsByDistrictName(district?.name ?? '')).length);

await DAO.close();
