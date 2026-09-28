export type Language = "zh" | "en";

export type Port = {
  id: string;
  zh: string;
  en: string;
  countyZh: string;
  countyEn: string;
  areaZh: string;
  areaEn: string;
  routesZh: string[];
  routesEn: string[];
  region: "north" | "east" | "south" | "west" | "islands";
  x: number;
  y: number;
  wave: number;
  period: number;
  wind: number;
  directionRisk: number;
  current: number;
  tideZh: string;
  tideEn: string;
  confidence: number;
  sourceZh: string;
  sourceEn: string;
};

const make = (
  id: string, zh: string, en: string, countyZh: string, countyEn: string,
  areaZh: string, areaEn: string, routesZh: string[], routesEn: string[],
  region: Port["region"], x: number, y: number, wave: number, period: number,
  wind: number, directionRisk: number, current: number, tideZh: string,
  tideEn: string, confidence: number, sourceZh: string, sourceEn: string,
): Port => ({ id, zh, en, countyZh, countyEn, areaZh, areaEn, routesZh, routesEn, region, x, y, wave, period, wind, directionRisk, current, tideZh, tideEn, confidence, sourceZh, sourceEn });

export const ports: Port[] = [
  make("keelung","基隆港","Keelung Harbor","基隆市","Keelung","基隆港外海","Keelung Offshore",["基隆港外海","基隆—馬祖航線"],["Keelung Offshore","Keelung–Matsu Route"],"north",75,12,1.05,6.1,6.3,.54,.45,"漲潮中","Rising",88,"航線與北部近海預報映射","Route + northern coastal forecast mapping"),
  make("badouzi","八斗子漁港","Badouzi Harbor","基隆市","Keelung","基隆東北近海","Northeast Keelung Waters",["八斗子近海","基隆嶼賞鯨海域"],["Badouzi Nearshore","Keelung Islet Whale Route"],"north",80,15,.82,6.2,5.1,.48,.38,"漲潮中","Rising",86,"鄰近海象站與東北部海面","Nearby marine station + northeast waters"),
  make("zhengbin","正濱漁港","Zhengbin Harbor","基隆市","Keelung","基隆嶼西南側","Southwest Keelung Islet",["正濱港外","基隆嶼航線"],["Zhengbin Offshore","Keelung Islet Route"],"north",78,18,.88,5.9,5.4,.5,.4,"漲潮中","Rising",82,"同海岸面鄰近站替代","Same-coast nearby station proxy"),
  make("shenao","深澳漁港","Shen'ao Harbor","新北市","New Taipei","瑞芳近海","Ruifang Nearshore",["深澳象鼻岩外海","基隆嶼南側"],["Shen'ao Offshore","South Keelung Islet"],"north",84,21,1.08,6.6,6.2,.61,.45,"接近滿潮","Near high tide",80,"東北部海面區域預報","Northeast regional marine forecast"),
  make("tamsui","淡水漁人碼頭","Tamsui Fisherman's Wharf","新北市","New Taipei","淡水河口外海","Tamsui Estuary",["淡水河口","北海岸近海"],["Tamsui Estuary","North Coast Nearshore"],"north",49,16,.68,5.1,5.8,.62,.52,"退潮中","Falling",84,"河口潮汐點與北部近海","Estuary tide point + northern waters"),
  make("fuji","富基漁港","Fuji Harbor","新北市","New Taipei","富貴角近海","Cape Fugui Waters",["富基港外","富貴角西側"],["Fuji Offshore","West Cape Fugui"],"north",39,20,1.12,6.9,7.1,.7,.58,"退潮中","Falling",79,"臺灣海峽北部區域預報","Northern Taiwan Strait forecast"),
  make("zhuwei","竹圍漁港","Zhuwei Harbor","桃園市","Taoyuan","桃園西北近海","Northwest Taoyuan Waters",["竹圍港外","桃園沿岸"],["Zhuwei Offshore","Taoyuan Coast"],"west",34,27,.74,5.3,6.1,.57,.49,"乾潮前","Before low tide",76,"海峽北部預報與沿岸風場","Northern Strait forecast + coastal wind"),
  make("yongan","永安漁港","Yong'an Harbor","桃園市","Taoyuan","桃園西部近海","West Taoyuan Waters",["永安港外","觀音沿岸"],["Yong'an Offshore","Guanyin Coast"],"west",30,33,.8,5.7,6.4,.55,.5,"乾潮前","Before low tide",75,"海峽北部區域預報","Northern Strait regional forecast"),
  make("nanliao","南寮漁港","Nanliao Harbor","新竹市","Hsinchu","新竹近海","Hsinchu Nearshore",["南寮港外","香山沿岸"],["Nanliao Offshore","Xiangshan Coast"],"west",28,39,.96,5.8,7.2,.62,.61,"轉漲","Turning rising",78,"新竹沿岸與海峽北部預報","Hsinchu coast + northern Strait forecast"),
  make("waipu","外埔漁港","Waipu Harbor","苗栗縣","Miaoli","苗栗近海","Miaoli Nearshore",["外埔港外","後龍近海"],["Waipu Offshore","Houlong Nearshore"],"west",26,45,1.02,6,7.5,.66,.62,"漲潮中","Rising",74,"海峽北部預報替代","Northern Strait forecast proxy"),
  make("wuqi","梧棲漁港","Wuqi Fishing Harbor","臺中市","Taichung","臺中港外海","Taichung Offshore",["梧棲外海","臺中—馬公航線"],["Wuqi Offshore","Taichung–Magong Route"],"west",25,51,1.08,6.3,7.7,.64,.66,"漲潮中","Rising",90,"藍色公路航段與海峽預報","Blue Highway segments + Strait forecast"),
  make("wanggong","王功漁港","Wanggong Harbor","彰化縣","Changhua","彰化沿海","Changhua Coastal Waters",["王功外海","芳苑潮間帶外緣"],["Wanggong Offshore","Fangyuan Outer Shoals"],"west",25,58,.72,5.1,6.9,.58,.72,"接近滿潮","Near high tide",72,"海峽中部預報與潮汐點","Central Strait forecast + tide point"),
  make("mailiao","麥寮港","Mailiao Harbor","雲林縣","Yunlin","雲林外海","Yunlin Offshore",["麥寮港外","濁水溪口外海"],["Mailiao Offshore","Zhuoshui Estuary Offshore"],"west",25,64,.86,5.4,7.1,.6,.7,"滿潮後","After high tide",74,"海峽中部區域預報","Central Strait regional forecast"),
  make("dongshi","東石漁港","Dongshi Harbor","嘉義縣","Chiayi","嘉義沿海","Chiayi Coastal Waters",["東石外海","外傘頂洲周邊"],["Dongshi Offshore","Waisanding Sandbar"],"west",26,70,.64,4.9,5.9,.51,.68,"退潮中","Falling",73,"潮汐點與海峽南部預報","Tide point + southern Strait forecast"),
  make("budai","布袋港","Budai Harbor","嘉義縣","Chiayi","布袋—馬公航線","Budai–Magong Route",["布袋港外","布袋—馬公航線"],["Budai Offshore","Budai–Magong Route"],"west",27,75,.91,5.6,6.8,.62,.71,"退潮中","Falling",86,"航線資料與海峽南部預報","Route data + southern Strait forecast"),
  make("jiangjun","將軍漁港","Jiangjun Harbor","臺南市","Tainan","臺南西北近海","Northwest Tainan Waters",["將軍港外","七股外海"],["Jiangjun Offshore","Qigu Offshore"],"west",29,81,.76,5.2,6.1,.55,.58,"乾潮前","Before low tide",76,"海峽南部區域預報","Southern Strait regional forecast"),
  make("anping","安平港","Anping Harbor","臺南市","Tainan","安平外海","Anping Offshore",["安平港外","臺南沿岸"],["Anping Offshore","Tainan Coast"],"west",31,87,.8,5.4,6.2,.52,.54,"轉漲","Turning rising",80,"沿岸站與海峽南部預報","Coastal station + southern Strait forecast"),
  make("xingda","興達港","Xingda Harbor","高雄市","Kaohsiung","高雄北側近海","North Kaohsiung Waters",["興達港外","茄萣沿岸"],["Xingda Offshore","Qieding Coast"],"south",34,91,.72,5.1,5.7,.48,.5,"漲潮中","Rising",76,"南部近海區域預報","Southern coastal regional forecast"),
  make("kaohsiung","高雄港","Kaohsiung Harbor","高雄市","Kaohsiung","高雄港外海","Kaohsiung Offshore",["高雄港外","旗津外海"],["Kaohsiung Offshore","Qijin Offshore"],"south",40,94,.66,5,5.2,.46,.44,"漲潮中","Rising",88,"港外觀測與南部近海預報","Offshore observation + southern forecast"),
  make("donggang","東港漁港","Donggang Harbor","屏東縣","Pingtung","東港—小琉球","Donggang–Xiaoliuqiu",["東港港外","東港—小琉球航線"],["Donggang Offshore","Donggang–Xiaoliuqiu Route"],"south",48,96,.78,5.5,5.6,.51,.62,"接近滿潮","Near high tide",89,"航線與南部近海資料映射","Route + southern marine mapping"),
  make("yanpu","鹽埔漁港","Yanpu Harbor","屏東縣","Pingtung","大鵬灣外海","Dapeng Bay Offshore",["鹽埔港外","小琉球東側"],["Yanpu Offshore","East Xiaoliuqiu"],"south",52,94,.82,5.6,5.8,.54,.59,"滿潮後","After high tide",84,"東港航線鄰近資料","Nearby Donggang route data"),
  make("houbihu","後壁湖漁港","Houbihu Harbor","屏東縣","Pingtung","恆春半島南側","South Hengchun Waters",["後壁湖外海","恆春潛水船海域"],["Houbihu Offshore","Hengchun Dive Waters"],"south",62,96,1.02,6.8,7,.63,.72,"退潮中","Falling",80,"南部近海與潮汐資料","Southern marine + tide data"),
  make("wushi","烏石港","Wushi Harbor","宜蘭縣","Yilan","龜山島賞鯨航線","Guishan Island Whale Route",["烏石港外海","龜山島賞鯨航線"],["Wushi Offshore","Guishan Whale Route"],"east",88,29,1.18,7.1,6.7,.64,.55,"漲潮中","Rising",87,"東北部海面與鄰近海象站","Northeast waters + nearby station"),
  make("nanfangao","南方澳漁港","Nanfang'ao Harbor","宜蘭縣","Yilan","蘇澳外海","Suao Offshore",["南方澳港外","蘇澳—花蓮沿岸"],["Nanfang'ao Offshore","Suao–Hualien Coast"],"east",90,36,1.36,7.4,7.2,.68,.61,"接近滿潮","Near high tide",89,"蘇澳外海觀測與東部近海","Suao offshore observation + east coast"),
  make("hualien","花蓮港","Hualien Harbor","花蓮縣","Hualien","花蓮賞鯨近海","Hualien Whale Waters",["花蓮港外海","花蓮賞鯨航線"],["Hualien Offshore","Hualien Whale Route"],"east",92,49,1.52,8.2,7.4,.7,.68,"滿潮後","After high tide",91,"花蓮海象觀測與東部預報","Hualien marine observation + east forecast"),
  make("shiti","石梯漁港","Shiti Harbor","花蓮縣","Hualien","花東海岸近海","Huatung Coastal Waters",["石梯港外","石梯坪賞鯨海域"],["Shiti Offshore","Shitiping Whale Waters"],"east",91,57,1.45,8,7.1,.68,.72,"退潮中","Falling",83,"東部近海區域預報","East coast regional forecast"),
  make("chenggong","成功漁港","Chenggong Harbor","臺東縣","Taitung","三仙台外海","Sanxiantai Offshore",["成功港外","三仙台近海"],["Chenggong Offshore","Sanxiantai Nearshore"],"east",89,67,1.34,7.6,6.8,.65,.7,"退潮中","Falling",84,"臺東外海觀測與東南部預報","Taitung offshore observation + southeast forecast"),
  make("jinfan","金樽漁港","Jinzun Harbor","臺東縣","Taitung","都蘭外海","Dulan Offshore",["金樽港外","都蘭近海"],["Jinzun Offshore","Dulan Nearshore"],"east",86,72,1.3,7.3,6.6,.63,.66,"乾潮前","Before low tide",78,"東南部海面區域預報","Southeast regional marine forecast"),
  make("fugang","富岡漁港","Fugang Harbor","臺東縣","Taitung","富岡—綠島航線","Fugang–Green Island Route",["富岡港外","富岡—綠島","富岡—蘭嶼"],["Fugang Offshore","Fugang–Green Island","Fugang–Orchid Island"],"east",83,78,1.42,7.8,7.3,.7,.74,"轉漲","Turning rising",90,"離島航線與東南部預報","Island route + southeast forecast"),
  make("dawu","大武漁港","Dawu Harbor","臺東縣","Taitung","臺東南部近海","South Taitung Waters",["大武港外","太麻里南側"],["Dawu Offshore","South Taimali"],"east",78,87,1.16,6.9,6.5,.6,.68,"漲潮中","Rising",76,"東南部海面區域預報","Southeast regional marine forecast"),
  make("magong","馬公港","Magong Harbor","澎湖縣","Penghu","澎湖內海與主要航線","Penghu Inner Sea & Routes",["馬公港外","馬公—布袋","馬公—臺中"],["Magong Offshore","Magong–Budai","Magong–Taichung"],"islands",14,57,1.05,6.4,7.6,.66,.8,"接近滿潮","Near high tide",92,"多條藍色公路航段","Multiple Blue Highway route segments"),
  make("longmen","龍門尖山港","Longmen Harbor","澎湖縣","Penghu","澎湖東側外海","East Penghu Waters",["龍門港外","澎湖東側航線"],["Longmen Offshore","East Penghu Route"],"islands",12,53,1.26,6.8,8.1,.7,.82,"滿潮後","After high tide",82,"澎湖近海與航段替代","Penghu coastal + route proxy"),
  make("shuitou","水頭港","Shuitou Harbor","金門縣","Kinmen","金門南側海域","South Kinmen Waters",["水頭港外","金門近海"],["Shuitou Offshore","Kinmen Nearshore"],"islands",6,72,.72,4.8,5.7,.48,.72,"退潮中","Falling",76,"潮汐點與近海區域預報","Tide point + regional marine forecast"),
  make("liaoluo","料羅港","Liaoluo Harbor","金門縣","Kinmen","金門東南海域","Southeast Kinmen Waters",["料羅港外","金門東南近海"],["Liaoluo Offshore","Southeast Kinmen"],"islands",8,69,.78,5,6,.52,.7,"退潮中","Falling",75,"近海區域預報","Regional marine forecast"),
  make("fuao","福澳港","Fu'ao Harbor","連江縣","Matsu","馬祖南竿近海","Nangan, Matsu Waters",["福澳港外","基隆—馬祖航線"],["Fu'ao Offshore","Keelung–Matsu Route"],"islands",71,4,1.45,7.2,8.2,.72,.84,"漲潮中","Rising",93,"基隆—馬祖藍色公路航段","Keelung–Matsu Blue Highway segments"),
  make("green-nanliao","綠島南寮漁港","Green Island Nanliao Harbor","臺東縣","Taitung","綠島西側海域","West Green Island Waters",["南寮港外","綠島環島海域"],["Nanliao Offshore","Green Island Coastal Waters"],"islands",95,74,1.34,7.6,7,.68,.78,"接近滿潮","Near high tide",84,"富岡航線與東南部預報","Fugang route + southeast forecast"),
  make("lanyu-kaiyuan","蘭嶼開元港","Lanyu Kaiyuan Harbor","臺東縣","Taitung","蘭嶼西北海域","Northwest Orchid Island",["開元港外","蘭嶼近海"],["Kaiyuan Offshore","Orchid Island Nearshore"],"islands",93,89,1.56,8.1,7.8,.73,.86,"滿潮後","After high tide",82,"離島航線與東南部預報","Island route + southeast forecast"),
];

export function label(port: Port, language: Language) {
  return language === "zh" ? port.zh : port.en;
}

export function areaLabel(port: Port, language: Language) {
  return language === "zh" ? port.areaZh : port.areaEn;
}

export function countyLabel(port: Port, language: Language) {
  return language === "zh" ? port.countyZh : port.countyEn;
}
