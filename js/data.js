// Pastovūs sąrašai: miestai, veislės, savybės

// Lietuvos miestai ir rajonų savivaldybės
const TOWNS = ['Vilnius', 'Kaunas', 'Klaipėda', 'Šiauliai', 'Panevėžys', 'Alytus', 'Marijampolė', 'Mažeikiai', 'Jonava', 'Utena',
  'Kėdainiai', 'Telšiai', 'Tauragė', 'Ukmergė', 'Visaginas', 'Plungė', 'Kretinga', 'Šilutė', 'Radviliškis', 'Palanga',
  'Gargždai', 'Druskininkai', 'Rokiškis', 'Biržai', 'Elektrėnai', 'Jurbarkas', 'Kuršėnai', 'Garliava', 'Vilkaviškis', 'Raseiniai',
  'Anykščiai', 'Lentvaris', 'Grigiškės', 'Prienai', 'Joniškis', 'Kelmė', 'Varėna', 'Kaišiadorys', 'Pasvalys', 'Naujoji Akmenė',
  'Kupiškis', 'Zarasai', 'Molėtai', 'Šakiai', 'Skuodas', 'Širvintos', 'Ignalina', 'Šalčininkai', 'Švenčionys', 'Trakai',
  'Kazlų Rūda', 'Pakruojis', 'Šilalė', 'Rietavas', 'Birštonas', 'Neringa', 'Lazdijai', 'Kalvarija', 'Pagėgiai', 'Akmenė'];
const DISTRICTS = ['Akmenės r.', 'Alytaus r.', 'Anykščių r.', 'Biržų r.', 'Ignalinos r.', 'Jonavos r.', 'Joniškio r.', 'Jurbarko r.',
  'Kaišiadorių r.', 'Kauno r.', 'Kėdainių r.', 'Kelmės r.', 'Klaipėdos r.', 'Kretingos r.', 'Kupiškio r.', 'Lazdijų r.', 'Mažeikių r.',
  'Molėtų r.', 'Pakruojo r.', 'Panevėžio r.', 'Pasvalio r.', 'Plungės r.', 'Prienų r.', 'Radviliškio r.', 'Raseinių r.', 'Rokiškio r.',
  'Skuodo r.', 'Šakių r.', 'Šalčininkų r.', 'Šiaulių r.', 'Šilalės r.', 'Šilutės r.', 'Širvintų r.', 'Švenčionių r.', 'Tauragės r.',
  'Telšių r.', 'Trakų r.', 'Ukmergės r.', 'Utenos r.', 'Varėnos r.', 'Vilkaviškio r.', 'Vilniaus r.', 'Zarasų r.'];
export const CITIES = [...TOWNS.sort((a, b) => a.localeCompare(b, 'lt')), ...DISTRICTS];

export const SPECIES = ['Šuo', 'Katė', 'Triušis', 'Graužikas', 'Paukštis', 'Šeškas', 'Roplys', 'Žuvys'];
// Daugiskaita greitiesiems filtrams
export const SPECIES_PLURAL = { 'Šuo': 'Šunys', 'Katė': 'Katės', 'Triušis': 'Triušiai', 'Graužikas': 'Graužikai', 'Paukštis': 'Paukščiai',
  'Šeškas': 'Šeškai', 'Roplys': 'Ropliai', 'Žuvys': 'Žuvys', };
export const UNKNOWN_BREED = 'Nežinoma (mišrūnas)';

// Tik naminiai gyvūnai, kuriuos įprasta laikyti namuose
export const BREEDS = {
  'Šuo': ['Airedeilo terjeras', 'Akita', 'Aliaskos malamutas', 'Amerikiečių stafordšyro terjeras', 'Anglų buldogas', 'Anglų kokerspanielis',
    'Australų aviganis', 'Auksaspalvis retriveris', 'Basendžis', 'Belgų aviganis', 'Bernardinas', 'Berno zenenhundas', 'Biglis', 'Bišonas frizė',
    'Bokseris', 'Bordo dogas', 'Borderkolis', 'Bostono terjeras', 'Prancūzų buldogas', 'Čihuahua', 'Dalmatinas', 'Dobermanas',
    'Džeko Raselo terjeras', 'Sibiro haskis', 'Havanos bišonas', 'Jorkšyro terjeras', 'Kaukazo aviganis', 'Kavalierius karalius Čarlis spanielis',
    'Kolis', 'Labradoro retriveris', 'Leonbergeris', 'Maltos bišonas', 'Mopsas', 'Niufaundlendas', 'Nykštukinis pinčeris', 'Papilionas',
    'Pekinas', 'Pitbulterjeras', 'Pomeranijos špicas', 'Pudelis', 'Rodezijos ridžbekas', 'Rotveileris', 'Rusų toiterjeras', 'Samojedas',
    'Šarpėjus', 'Ši cu', 'Šnauceris', 'Šetlando aviganis', 'Taksas', 'Vengrų vižla', 'Velso korgis', 'Vokiečių aviganis', 'Vokiečių dogas',
    'Vokiečių trumpaplaukis paukštšunis', 'Vakarų Škotijos baltasis terjeras', 'Vidurinės Azijos aviganis'],
  'Katė': ['Abisinijos', 'Bengalijos', 'Birmos', 'Britų trumpaplaukė', 'Britų ilgaplaukė', 'Devon reksas', 'Europinė trumpaplaukė',
    'Egzotinė trumpaplaukė', 'Meino meškėnas', 'Norvegų miškinė', 'Orientalinė', 'Persų', 'Ragdolas', 'Rusų mėlynoji', 'Sfinksas',
    'Siamo', 'Sibiro', 'Škotų nulėpausė', 'Turkų angora'],
  'Triušis': ['Dekoratyvinis nykštukinis', 'Avinėlis (nulėpausis)', 'Liūtagalvis', 'Reksas', 'Angoros', 'Olandų', 'Kita veislė'],
  'Graužikas': ['Jūrų kiaulytė', 'Žiurkėnas', 'Džiungarinis žiurkėnas', 'Šinšila', 'Degu', 'Dekoratyvinė žiurkė', 'Dekoratyvinė pelė', 'Smiltpelė'],
  'Paukštis': ['Banguotoji papūgėlė', 'Nimfinė papūga (korela)', 'Neišskiriamoji papūga', 'Žakas', 'Ara', 'Kakadu', 'Kanarėlė', 'Zebrinė amadina', 'Balandis'],
  'Šeškas': ['Naminis šeškas'],
  'Roplys': ['Raudonausis vėžlys', 'Sausumos vėžlys', 'Leopardinis gekonas', 'Barzdotoji agama', 'Kukurūzinė gyvatė', 'Karališkasis pitonas'],
  'Žuvys': ['Auksinė žuvelė', 'Gupija', 'Kovotoja (betta)', 'Skaliarė', 'Kita akvariumo žuvis'],
};

export const TRAITS = ['Ramus', 'Draugiškas vaikams', 'Aktyvus', 'Tinka butui', 'Sutaria su kitais', 'Sutaria su katėmis'];
export const HEALTH = ['Paskiepytas', 'Kastruotas / sterilizuotas', 'Čipuotas', 'Pasas'];
export const REPORT_REASONS = ['Netikras skelbimas ar apgavystė', 'Prašo pinigų / gyvūnas pardavinėjamas', 'Netinkamos nuotraukos ar tekstas', 'Kita priežastis'];

export const PHONE_RE = /(\+?370|8)[\s-]?6\d{2}[\s-]?\d{2}[\s-]?\d{3}/;

// „Ne pardavimui“ – žodžiai, dėl kurių skelbimas siunčiamas administratoriui patikrinti
// (ta pati taisyklė veikia ir duomenų bazėje, žr. supabase/schema.sql → check_sale_words)
const SALE_RE = /(kain\p{L}*|parduod\p{L}*|pardav\p{L}*|mokest\p{L}*|atlyg\p{L}*|užstat\p{L}*|apmokė\p{L}*|sumokė\p{L}*|pinig\p{L}*|kompensac\p{L}*|€|(?<!\p{L})(?:eur|eurų|eurai|euro|perku)(?!\p{L}))/giu;
export const saleWords = text => [...new Set((String(text || '').match(SALE_RE) || []).map(w => w.toLowerCase()))];
