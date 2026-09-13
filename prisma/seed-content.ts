/**
 * Sayfa ve blog içerikleri — seed.ts tarafından kullanılır.
 * Tümü admin panelinden düzenlenebilir; buradakiler ilk kurulum içeriğidir.
 *
 * NOT: Blog yazılarındaki tıbbi bilgiler genel kabul görmüş veteriner
 * hekimlik pratiğine dayanır; yayına almadan önce klinik hekiminizin
 * gözden geçirmesi gerekir.
 */

export const pages = [
  {
    slug: "hakkimizda",
    title: "Bornova'nın veteriner kliniği",
    intro:
      "10 yıldır aynı mahallede, aynı ekiple; dostunuzun sağlık geçmişi bizde kayıtlı kalıyor.",
    seoTitle: "Hakkımızda | Kıymet Veteriner Kliniği Bornova",
    seoDescription:
      "Bornova'da 10 yıldır hizmet veren Kıymet Veteriner Kliniği'nin ekibi, imkanları ve çalışma prensibi.",
    content: `Kıymet Veteriner Kliniği, İzmir Bornova'da kedi ve köpeklere yönelik koruyucu hekimlik, dahiliye, cerrahi ve acil hizmet veren bir veteriner kliniğidir.

## Nasıl çalışıyoruz

Kliniğimizde her ziyaret detaylı bir muayeneyle başlar. Sahibinden alınan bilgi bizim için tahlil kadar değerlidir: dostunuzun ne zamandır şikayeti olduğu, iştahındaki değişim, tuvalet alışkanlıkları ve davranış farklılıkları teşhisi doğrudan etkiler.

Gerekli görülürse klinik içi laboratuvarımızda tahliller yapılır ve sonuçlar aynı ziyaret içinde değerlendirilir. Böylece tedaviye başlamak için ertesi günü beklemek gerekmez — bu, özellikle acil vakalarda kritik önemdedir.

## İmkanlarımız

- Klinik içi laboratuvar: hemogram, biyokimya, hızlı enfeksiyon testleri
- Dijital röntgen ve ultrason
- Modern anestezi cihazı ve operasyon boyunca kesintisiz monitörizasyon
- Ultrasonik diş taşı temizleme ünitesi
- Yatarak tedavi için ayrı kedi ve köpek bölümleri

## Yaklaşımımız

Amacımız yalnızca hastalığı tedavi etmek değil, dostunuzun yaşam kalitesini uzun vadede korumak. Bu yüzden aşı takvimi, parazit koruması, diş sağlığı ve beslenme konularında da yol gösteriyoruz.

Tedavi seçeneklerini, sürelerini ve maliyetlerini işlem öncesinde açıkça paylaşırız. Kararı birlikte veririz.

## Acil durumlar

Acil hattımız haftanın yedi günü, 24 saat açıktır. Yüksekten düşme, araç çarpması, zehirli madde yutma, nefes darlığı, doğum güçlüğü, idrar yapamama ve havale geçirme durumlarında vakit kaybetmeden arayın. Yolda olduğunuzu bildirmeniz hazırlığa başlamamızı sağlar ve müdahale süresini kısaltır.`,
  },
  {
    slug: "kvkk",
    title: "KVKK Aydınlatma Metni",
    intro:
      "6698 sayılı Kişisel Verilerin Korunması Kanunu kapsamında veri sorumlusu sıfatıyla bilgilendirme.",
    seoTitle: "KVKK Aydınlatma Metni | Kıymet Veteriner Kliniği",
    seoDescription:
      "Kıymet Veteriner Kliniği kişisel verilerin işlenmesine ilişkin aydınlatma metni.",
    content: `Bu metin, 6698 sayılı Kişisel Verilerin Korunması Kanunu uyarınca, Kıymet Veteriner Kliniği tarafından veri sorumlusu sıfatıyla hazırlanmıştır.

## Hangi verileri işliyoruz

Randevu oluşturduğunuzda veya kliniğimizden hizmet aldığınızda şu veriler işlenir:

- **Kimlik ve iletişim bilgileri:** ad soyad, telefon numarası, e-posta adresi, talep etmeniz halinde adres
- **Hasta bilgileri:** hayvanın adı, türü, ırkı, yaşı, sağlık geçmişi ve tedavi kayıtları
- **Talep bilgileri:** randevu tarihi, seçilen hizmet ve iletmek istediğiniz notlar

## İşleme amacı ve hukuki sebebi

Verileriniz; randevunuzun oluşturulması ve teyit edilmesi, veteriner hekimlik hizmetinin sunulması, hasta kayıtlarının tutulması ve yasal yükümlülüklerimizin yerine getirilmesi amacıyla işlenir.

Hukuki sebep, KVKK m.5/2-c uyarınca sözleşmenin kurulması ve ifası ile m.5/2-ç uyarınca hukuki yükümlülüğün yerine getirilmesidir. Bunların dışındaki işlemeler açık rızanıza dayanır.

## Verilerin aktarımı

Kişisel verileriniz, hizmetin sunulması için zorunlu olduğu ölçüde barındırma ve e-posta gönderim hizmeti aldığımız tedarikçilerle ve yasal talep halinde yetkili kamu kurumlarıyla paylaşılabilir. Bunun dışında üçüncü kişilere aktarılmaz, pazarlama amacıyla satılmaz.

## Saklama süresi

Hasta kayıtları, veteriner hekimlik mevzuatının öngördüğü süre boyunca saklanır. İletişim verileri, ilişkinin sona ermesinden itibaren yasal zamanaşımı süreleri dolana kadar tutulur.

## Haklarınız

KVKK m.11 uyarınca; verilerinizin işlenip işlenmediğini öğrenme, işlenmişse bilgi talep etme, işlenme amacını öğrenme, eksik veya yanlış işlenmişse düzeltilmesini isteme, silinmesini veya yok edilmesini isteme, işlemenin sınırlandırılmasını talep etme ve zarara uğramanız halinde zararın giderilmesini talep etme haklarına sahipsiniz.

Taleplerinizi kliniğimizin iletişim kanallarından bize iletebilirsiniz. Başvurunuz en geç otuz gün içinde sonuçlandırılır.`,
  },
  {
    slug: "gizlilik-politikasi",
    title: "Gizlilik Politikası",
    intro: "Bu sitede hangi bilgilerin toplandığı ve nasıl kullanıldığı.",
    seoTitle: "Gizlilik Politikası | Kıymet Veteriner Kliniği",
    seoDescription:
      "Kıymet Veteriner Kliniği web sitesi gizlilik politikası ve çerez kullanımı.",
    content: `Bu politika, sitemizi ziyaret ettiğinizde bilgilerinizin nasıl işlendiğini açıklar.

## Topladığımız bilgiler

Siteyi yalnızca gezerken kimlik bilgisi toplamıyoruz. Randevu formunu doldurduğunuzda ise formda girdiğiniz bilgiler — ad soyad, telefon, e-posta, hayvanınıza dair bilgiler ve notunuz — kayıt altına alınır.

## Bilgileri ne için kullanıyoruz

Form aracılığıyla ilettiğiniz bilgiler yalnızca randevunuzu oluşturmak, sizi arayarak teyit etmek ve muayeneye hazırlanmak için kullanılır. Onayınız olmadan tanıtım mesajı göndermeyiz.

## Çerezler

Sitemiz, çalışması için gerekli olan teknik çerezleri kullanır. Bu çerezler oturum yönetimi ve güvenlik amacı taşır, kişisel profil oluşturmaz.

## Güvenlik

Bilgileriniz şifreli bağlantı üzerinden iletilir ve erişimi yetkili klinik personeliyle sınırlı bir veritabanında saklanır. Yönetim paneline erişim şifreyle korunmaktadır.

## Üçüncü taraflar

Site barındırma ve e-posta gönderimi için hizmet aldığımız sağlayıcılar dışında verileriniz kimseyle paylaşılmaz. Bu sağlayıcılar da verilerinizi yalnızca hizmeti sunmak için işler.

## Değişiklikler

Bu politika güncellenebilir. Güncel sürüm her zaman bu sayfada yayımlanır.`,
  },
  {
    slug: "kullanim-sartlari",
    title: "Kullanım Şartları",
    intro: "Bu siteyi kullanırken geçerli olan koşullar.",
    seoTitle: "Kullanım Şartları | Kıymet Veteriner Kliniği",
    seoDescription: "Kıymet Veteriner Kliniği web sitesi kullanım şartları.",
    content: `Bu siteyi kullanarak aşağıdaki şartları kabul etmiş olursunuz.

## İçeriğin niteliği

Sitede yer alan yazılar ve bilgiler genel bilgilendirme amaçlıdır. **Hiçbir içerik veteriner hekim muayenesinin yerini tutmaz.** Dostunuzda bir belirti gözlemlediğinizde internetteki bilgilere dayanarak kendi başınıza tedavi uygulamayın; kliniğimizle iletişime geçin.

## Randevu talepleri

Online randevu formu üzerinden ilettiğiniz talep, bir randevu talebi niteliğindedir. Randevunuz, ekibimiz sizi telefonla arayıp teyit ettiğinde kesinleşir. Teyit almadan kliniğe gelmeniz halinde bekleme süresi yaşanabilir.

Randevunuzu iptal etmek veya değiştirmek isterseniz, randevu saatinden en az iki saat önce bizi aramanızı rica ederiz. Böylece o saat ihtiyacı olan başka bir hastaya açılır.

## Fiyat bilgileri

Sitede yayımlanan fiyatlar bilgilendirme amaçlıdır. Kesin ücret; hastanın kilosu, yaşı, genel durumu ve işlemin kapsamına göre muayene sonrasında netleşir.

## Fikri mülkiyet

Sitedeki metin, görsel ve tasarım öğeleri Kıymet Veteriner Kliniği'ne aittir. İzinsiz kopyalanamaz ve çoğaltılamaz.

## İletişim

Şartlara ilişkin sorularınız için kliniğimizin iletişim kanallarından bize ulaşabilirsiniz.`,
  },
];

export const posts = [
  {
    slug: "kedilerde-asi-takvimi",
    title: "Kedilerde aşı takvimi: hangi aşı ne zaman yapılır?",
    excerpt:
      "Yavru kedinizin ilk aşısından erişkinlikteki tekrar dozlarına kadar, aşı takviminin nasıl işlediğini adım adım anlattık.",
    tags: ["kedi", "aşı", "koruyucu hekimlik"],
    coverImage: "/img/cat-gray.webp",
    seoTitle: "Kedilerde Aşı Takvimi | Bornova Veteriner",
    seoDescription:
      "Yavru ve erişkin kedilerde karma aşı, kuduz aşısı ve tekrar dozları ne zaman yapılır? Bornova'daki kliniğimizden rehber.",
    content: `Aşılama, kedilerde ölümcül olabilen bulaşıcı hastalıklara karşı en etkili korunma yöntemidir. Aşı takvimi düzenli uygulandığında, panlökopeni ve kalisivirüs gibi hastalıkların riski belirgin biçimde azalır.

## Yavru kedilerde başlangıç

Yavru kediler anne sütüyle geçici bir bağışıklık alır. Bu bağışıklık zamanla azaldığı için aşılamaya genellikle 6-8. haftada başlanır.

- **6-8. hafta:** İlk karma aşı
- **3-4 hafta sonra:** Karma aşı tekrarı
- **12. haftadan sonra:** Kuduz aşısı

Aşı programı tamamlanana kadar yavrunuzu dışarı çıkarmamanızı ve aşısız hayvanlarla temasını sınırlamanızı öneriyoruz.

## Erişkin kedilerde tekrar dozları

İlk seri tamamlandıktan sonra karma aşı ve kuduz aşısı yılda bir kez tekrarlanır. Tekrar dozu geciktiğinde bağışıklık zayıflar; aradan uzun süre geçtiyse programın yeniden kurulması gerekebilir.

## Aşı öncesi nelere dikkat edilir

Aşı, sağlıklı hayvana uygulanır. Bu yüzden her aşı öncesinde kısa bir muayene yapıyoruz. Ateşi olan, ishal veya iştahsızlık şikayeti bulunan kedilerde aşı ertelenir.

İç ve dış parazit uygulamasının aşıdan önce yapılmış olması, bağışıklık yanıtının güçlü olmasına yardımcı olur.

## Aşı sonrası beklenenler

Aşıdan sonraki bir gün boyunca hafif halsizlik ve uyku hali normaldir. Aşı yerinde küçük bir şişlik oluşabilir ve birkaç gün içinde geçer.

Ancak yüzde şişme, kusma, ishal veya nefes darlığı görülürse vakit kaybetmeden bizi arayın — bunlar nadir görülen alerjik reaksiyonun belirtisi olabilir.

## Ev kedisine aşı gerekli mi?

Evet. Hiç dışarı çıkmayan kediler de risk altındadır: virüsler ayakkabı, kıyafet ve eşya üzerinden eve taşınabilir. Ayrıca kuduz aşısı, seyahat ve konaklama işlemlerinde yasal olarak aranır.

Yavrunuza özel takvimi ilk muayenede birlikte çıkaralım.`,
  },
  {
    slug: "kopeklerde-kisirlastirma",
    title: "Köpeklerde kısırlaştırma: doğru zaman ve merak edilenler",
    excerpt:
      "Kısırlaştırmanın sağlık üzerindeki etkileri, uygun yaş aralığı ve operasyon sonrası bakım hakkında bilmeniz gerekenler.",
    tags: ["köpek", "cerrahi", "kısırlaştırma"],
    coverImage: "/img/dog-outdoors.webp",
    seoTitle: "Köpeklerde Kısırlaştırma Ne Zaman Yapılmalı? | Bornova Veteriner",
    seoDescription:
      "Köpeklerde kısırlaştırma için uygun yaş, operasyon süreci ve sonrasındaki bakım. Bornova'daki kliniğimizden rehber.",
    content: `Kısırlaştırma, istenmeyen üremeyi önlemenin yanı sıra bazı hastalık risklerini de azaltan yaygın bir cerrahi işlemdir. Ancak her köpek için tek bir doğru zaman yoktur; karar ırka, boyuta ve bireysel duruma göre verilir.

## Uygun yaş

Küçük ırklarda genellikle 6-9 ay, büyük ırklarda ise iskelet gelişiminin tamamlanmasını beklemek üzere 12-18 ay aralığı önerilir. Büyük ırklarda erken kısırlaştırmanın eklem sağlığı üzerinde etkisi olabileceği için bu bekleme önemlidir.

Dişilerde ilk kızgınlık öncesinde yapılan kısırlaştırmanın meme tümörü riskini azalttığı bilinmektedir.

## Sağlık üzerindeki etkileri

- Dişilerde rahim iltihabı riski ortadan kalkar
- Meme tümörü görülme olasılığı azalır
- Erkeklerde prostat sorunları ve testis tümörü riski düşer
- Bölge işaretleme ve kaçma davranışında azalma görülebilir

## Operasyon öncesi hazırlık

Her operasyon öncesinde kan tahlili yaparak anestezi uygunluğunu değerlendiriyoruz. Yetişkin köpeklerde işlemden önce 8-12 saat katı gıda verilmemelidir; su genellikle iki saat öncesine kadar serbesttir.

Yavru ve kronik hastalığı olan hastalarda bu süreler değişir, size özel talimat veririz.

## Operasyon sonrası bakım

Dostunuz aynı gün taburcu olur. İlk 24 saatte uyku hali ve iştahsızlık normaldir.

- Dikiş bölgesini yalamasını önlemek için koruyucu yaka kullanın
- Yarayı temiz ve kuru tutun, ıslatmayın
- İlk hafta koşu, zıplama ve merdiven çıkmayı sınırlayın
- Ağrı kesici ve antibiyotikleri tarif edildiği şekilde uygulayın

Dikişler genellikle 10-14 gün sonra alınır.

## Ne zaman aramalısınız

Yara yerinde akıntı, aşırı kızarıklık veya şişlik; iki günden uzun süren iştahsızlık; tekrarlayan kusma ya da belirgin halsizlik durumunda bizi arayın.

Dostunuz için uygun zamanı muayenede birlikte belirleyelim.`,
  },
  {
    slug: "acil-durum-belirtileri",
    title: "Hemen veterinere gitmeniz gereken 10 belirti",
    excerpt:
      "Bazı belirtiler sabaha kadar beklemez. Kedi ve köpeklerde acil müdahale gerektiren durumları listeledik.",
    tags: ["acil", "kedi", "köpek"],
    coverImage: "/img/hero-dog.webp",
    seoTitle: "Acil Veteriner Gerektiren Belirtiler | Bornova 7/24",
    seoDescription:
      "Kedi ve köpeklerde acil müdahale gerektiren belirtiler. Bornova'da 7/24 acil veteriner hattı.",
    content: `Evcil hayvanlar rahatsızlıklarını gizleme eğilimindedir; bu yüzden belirti fark edildiğinde durum çoğu zaman ilerlemiş olur. Aşağıdaki durumlar sabaha kadar beklemez.

## 1. Nefes almakta zorlanma

Ağzı açık soluma — kedilerde özellikle — burun delikleri açılıp kapanarak nefes alma, dilde morarma. Bu durumda hayvanı sakin tutun ve hemen yola çıkın.

## 2. İdrar yapamama

Özellikle erkek kedilerde idrar yolu tıkanıklığı hayati tehlike taşır. Kum kabına sık girip çıkma, çömelip idrar yapamama, miyavlama görülüyorsa saatler önemlidir.

## 3. Tekrarlayan kusma veya kanlı ishal

Günde birkaç kez tekrarlayan kusma, sıvı kaybına yol açar. Kusmukta veya dışkıda kan varsa beklemeyin.

## 4. Zehirli madde yutma

Çikolata, üzüm, soğan, ksilitol içeren ürünler, fare zehiri, antifriz ve pek çok insan ilacı evcil hayvanlar için toksiktir. Yuttuğunu düşündüğünüz maddenin ambalajını yanınıza alın.

## 5. Havale geçirme

Kasılma, bilinç kaybı, ağızdan köpük gelmesi. Nöbet sırasında hayvana müdahale etmeyin, çevresindeki sert cisimleri uzaklaştırın ve nöbetin ne kadar sürdüğünü not edin.

## 6. Travma

Araç çarpması, yüksekten düşme veya darbe sonrası dışarıdan yara görünmese bile iç kanama olabilir.

## 7. Doğum güçlüğü

Kasılmalar başladıktan sonra 30-60 dakika içinde yavru gelmiyorsa ya da iki yavru arasında iki saatten uzun süre geçtiyse arayın.

## 8. Karında şişlik ve huzursuzluk

Özellikle büyük ırk köpeklerde mide burulması, çok hızlı ilerleyen ve acil cerrahi gerektiren bir durumdur.

## 9. Durmayan kanama

Beş dakika baskı uygulanmasına rağmen durmayan kanamalarda temiz bir bezle bastırarak yola çıkın.

## 10. Ani felç veya ayakta duramama

Arka bacaklarını sürükleme, dengesini kaybetme veya ayağa kalkamama; omurga ya da nörolojik bir soruna işaret edebilir.

## Yola çıkmadan önce

Acil hattımızı arayıp durumu kısaca anlatın. Yolda olduğunuzu bilmemiz, siz gelene kadar hazırlık yapmamızı sağlar ve müdahale süresini kısaltır.

Acil hattımız haftanın yedi günü, 24 saat açıktır.`,
  },
];
