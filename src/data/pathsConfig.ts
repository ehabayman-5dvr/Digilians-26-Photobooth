import { LearningPathConfig } from '../types/photobooth';

export const LEARNING_PATHS: LearningPathConfig[] = [
  {
    id: 'ai_software',
    order: 1,
    nameEn: 'AI-Powered Software',
    nameAr: 'تطوير البرمجيات بالذكاء الاصطناعي',
    taglineEn: 'Build apps that think and learn',
    taglineAr: 'ابنِ تطبيقات تفكّر وتتعلّم',
    accent: '#3399FF',
    cardImage: 'assets/paths/ai-software.jpg',
    loadingBadgeEn: 'BUILD RUNNING',
    loadingBadgeAr: 'جاري البناء البرمجي',
    loadingTheme: 'software',
    milestones: [
      { ar: 'نكتب الكود', en: 'Writing the code' },
      { ar: 'نُجمّع المكوّنات', en: 'Compiling components' },
      { ar: 'نشغّل التطبيق', en: 'Running the build' },
      { ar: 'نُطلق نسختك', en: 'Deploying your version' },
      { ar: 'صورتك جاهزة!', en: 'Your photo is ready!' },
    ],
    scenes: [
      {
        id: 'sw_v1',
        name: 'AI Coding & App Studio',
        nameAr: 'استوديو البرمجة الذكي',
        landmark: 'Warm-Lit Futuristic AI Software Studio',
        description:
          'Cozy yet high-tech modern software studio at dusk with a glowing circular ceiling ring light, warm indoor greenery on shelving, a twilight city skyline window, and a sleek round table projecting glowing cyan-and-violet holographic app wireframes, code-line icons, and a rocket launch icon. A cute glowing white-and-purple AI companion robot with headphones rests its chin on the table alongside a tiny floating purple helper bot.',
        lighting:
          'Vibrant editorial studio lighting: warm golden-peach key light from overhead ring mixed with soft cyan and violet holographic table bounce.',
        poseDirective:
          'Solo guest: seated or leaning warmly behind the round studio table with a sleek laptop or tablet, smiling naturally toward the camera beside the cute AI companion robot. Group (2+ guests): gather side-by-side behind the table—one pointing at a laptop, one resting chin thoughtfully or holding a stylus with a tablet—with all faces clearly visible.',
      },
      {
        id: 'sw_v2',
        name: 'Gamified App & Game Builder',
        nameAr: 'مصنع الألعاب والتطبيقات',
        landmark: 'Giant Smartphone Portal to a Floating Sky-Island World',
        description:
          'Vibrant futuristic digital arena framed by a giant glowing neon-blue smartphone portal opening into a bright sky-island game world with floating voxel platforms, waterfalls, a distant castle, gold star coins, and glowing icon-only holographic UI cards (gamepad, app grid, magic AI spark icons). Participants stand on a circular glowing cyan light-ring platform surrounded by playful voxel blocks.',
        lighting:
          'Bright, crisp daylight-meets-neon studio illumination with electric blue and soft violet rim highlights and clean shadow grounding on the glowing platform.',
        poseDirective:
          'Solo guest: standing casually in the center of the glowing circular platform with a relaxed, confident posture (arms lightly folded or hands resting naturally in pockets/at sides), smiling warmly at the camera. Group (2+ guests): stand side-by-side on the glowing platform in relaxed, photogenic stances (hands casually in pockets, arms lightly folded, or relaxed at sides) while the glowing play-button stack and violet app-UI panel float cleanly beside them—no pointing or poking at floating screens.',
      },
      {
        id: 'sw_v3',
        name: 'Software Mega-City Architects',
        nameAr: 'معماريو المدن البرمجية',
        landmark: 'Futuristic Digital Metropolis Under Construction',
        description:
          'Epic sunlit-blue futuristic skyscraper metropolis under construction with yellow tower cranes lifting glowing cyan code-bracket cubes, sweeping holographic light rings, and miniature glowing city towers rising across a reflective bridge below, plus clean icon-only holographic blueprint wireframes and modular UI tiles.',
        lighting:
          'Crisp golden-hour daylight combined with luminous cyan and cobalt holographic glow on faces and attire.',
        poseDirective:
          'Solo guest: standing heroically at center, holding a glowing cyan wireframe cube between both hands while facing the camera. Group (2+ guests): stand together at the foreground—center guest cradling the glowing wireframe cube, flanking guests holding translucent cyan wireframe blueprint panels and modular icon grids.',
      },
    ],
    outfits: [
      {
        id: 'sw_o1',
        name: 'Studio Developer Tech-Casual',
        style: 'Modern developer studio attire',
        description:
          'FOR MEN / BOYS: Olive-green utility bomber jacket layered over a neutral hoodie with a small glowing code-bracket shoulder patch and smartwatch. FOR WOMEN / GIRLS: Layered sand-beige utility vest over a cream long-sleeve shirt, or crisp white collared shirt under dark-denim studio overalls with a small code-bracket pocket patch and stylus.',
        femaleNotes:
          '(A) If wearing hijab in IMAGE 1, keep a neat sand-beige opaque hijab with full-length opaque sleeves. (B) If hair is uncovered in IMAGE 1, preserve natural hair cleanly with the same modest full-sleeve studio outfit.',
      },
      {
        id: 'sw_o2',
        name: 'Neon-Piped Creator Techwear',
        style: 'Futuristic game & app builder streetwear',
        description:
          'FOR MEN / BOYS: Olive-charcoal technical jacket with warm amber LED piping, black cargo pants, sneakers, and over-ear headphones around neck. FOR WOMEN / GIRLS: Futuristic beige-and-lavender flowing utility trench/tunic with subtle violet neon piping and cargo trousers, OR purple cropped tech jacket with cargo pants, headphones, and a glowing gamepad crossbody bag.',
        femaleNotes:
          '(A) If wearing hijab in IMAGE 1, match with a soft beige opaque hijab and full-length opaque trench/jacket sleeves. (B) If hair is uncovered in IMAGE 1, preserve natural hair with the purple or beige full-sleeve techwear.',
      },
      {
        id: 'sw_o3',
        name: 'Digital Software Architect Gear',
        style: 'Futuristic tech-architect uniform',
        description:
          'FOR MEN / BOYS: Olive-charcoal utility field jacket with tool harness straps, wrist tablet, and sleek dark visor/hard-hat with glowing cyan code-bracket emblem. FOR WOMEN / GIRLS: Tailored taupe-grey futuristic architect long coat with gold-and-cyan trim, utility belt with rolled blueprints, or dark-navy technical jumpsuit with orange-piped pockets and raised visor goggles.',
        femaleNotes:
          '(A) If wearing hijab in IMAGE 1, keep a coordinated taupe/beige opaque hijab under the sleek headset band with full-length opaque coat sleeves. (B) If hair is uncovered in IMAGE 1, preserve natural hair cleanly with raised visor goggles on forehead or no headgear.',
      },
    ],
  },
  {
    id: 'applied_ai',
    order: 2,
    nameEn: 'Applied AI & Data Analytics',
    nameAr: 'الذكاء الاصطناعي التطبيقي وتحليل البيانات',
    taglineEn: 'Predict the future through data',
    taglineAr: 'تنبّأ بالمستقبل من خلال البيانات',
    accent: '#00FF99',
    cardImage: 'assets/paths/applied-ai.jpg',
    loadingBadgeEn: 'FORECAST ENGINE',
    loadingBadgeAr: 'محرّك التنبؤ',
    loadingVideo: 'assets/loading/data-forecast.mp4',
    loadingTheme: 'data',
    milestones: [
      { ar: 'نجمع البيانات', en: 'Collecting data points' },
      { ar: 'نكتشف الأنماط', en: 'Finding the patterns' },
      { ar: 'نتنبأ بمستقبلك', en: 'Forecasting your future' },
      { ar: 'نرسم النتيجة', en: 'Plotting the result' },
      { ar: 'صورتك جاهزة!', en: 'Your photo is ready!' },
    ],
    scenes: [
      {
        id: 'da_v1',
        name: 'Weather Prediction Lab',
        nameAr: 'مختبر التنبؤ بالطقس',
        landmark: 'Storm & Climate Forecast Analytics Lab',
        description:
          'High-tech weather prediction lab with a dramatic lightning storm visible through a tall window, a glowing blue wall monitor displaying a storm-cloud & lightning icon, and a sleek circular table holding a luminous glass dome containing a miniature 3D raincloud, lightning bolt, and terrain map. A cute tiny white weather-bot mascot stands on the table beside a laptop.',
        lighting:
          'Warm overhead circular ring key light balanced against cool storm-blue window light and vivid cyan holographic dome glow.',
        poseDirective:
          'Solo guest: leaning or standing comfortably behind the circular table with hands resting naturally on the table or holding the translucent glowing-edged umbrella, smiling at the camera beside the glowing storm dome. Group (2+ guests): gather closely behind the table in relaxed poses—hands resting warmly on the table, resting chin lightly on hand, or holding the translucent umbrella—with no pointing.',
      },
      {
        id: 'da_v2',
        name: 'Data Detective Agency',
        nameAr: 'وكالة محققي البيانات',
        landmark: 'Investigative Analytics Study',
        description:
          'Warm-lit investigative analytics desk with a vintage brass overhead lamp, a corkboard in the background pinned with bar-chart and pie-chart cards connected by red string, a laptop with glowing blue bar-chart graphics, a printed chart sheet, and a tipped white coffee mug revealing a tiny glowing cute blue data-cube character under a large brass magnifying glass.',
        lighting:
          'Rich warm amber desk-lamp key light contrasted with cool midnight-blue studio background and crisp cyan chart highlights.',
        poseDirective:
          'Solo guest: leaning over the desk holding a glowing-lens magnifying glass toward the camera or inspecting the chart sheet with an inquisitive smile. Group (2+ guests): lean together behind the desk—one holding a small glowing bar-chart magnifying glass, center guest smiling warmly, another holding a large magnifying glass over the tipped mug on the desk.',
      },
      {
        id: 'da_v3',
        name: 'Supply Chain & Growth Simulation',
        nameAr: 'محاكاة سلاسل الإمداد والنمو',
        landmark: 'Neon Analytics & Simulation Arena',
        description:
          'Vibrant deep-blue-and-violet analytics arena with curved overhead holographic screens showing glowing upward bar and line-growth charts, and a circular glowing blue table featuring a large luminous green Play button surrounded by a miniature 3D supply-chain diorama (clean toy-like factory, purple delivery truck on a glowing arrow path, and red-and-white retail shop).',
        lighting:
          'Crisp bright front studio key light with vibrant emerald-green, electric-blue, and soft magenta rim accents.',
        poseDirective:
          'Solo guest: standing or leaning comfortably behind the circular simulation table with hands resting naturally on the table edge, smiling confidently at the camera behind the glowing green Play button and 3D diorama. Group (2+ guests): gather behind the table in relaxed poses—resting hands casually on the table or holding a glowing bar-chart magnifying glass—with no pointing or reaching.',
      },
    ],
    outfits: [
      {
        id: 'da_o1',
        name: 'Weather Lab Field Jackets',
        style: 'Colorful meteorology techwear',
        description:
          'FOR MEN / BOYS: Bright amber-yellow weatherproof tech jacket with reflective trim, storm-cloud sleeve patch, and headphones around neck. FOR WOMEN / GIRLS: Crisp light-grey utility lab jacket with sun-cloud pocket patch and smartwatch, OR vibrant cobalt-blue weather jacket with rain-cloud sleeve patch.',
        femaleNotes:
          '(A) If wearing hijab in IMAGE 1, keep a neat sand-beige opaque hijab with full-length opaque jacket sleeves. (B) If hair is uncovered in IMAGE 1, preserve natural hair cleanly (optional sunglasses resting on top of head) with full-length sleeves.',
      },
      {
        id: 'da_o2',
        name: 'Data Detective Trench Coats',
        style: 'Classic investigative trench attire',
        description:
          'FOR MEN / BOYS: Classic tan detective trench coat over a dark navy collared shirt with smartwatch. FOR WOMEN / GIRLS: Classic tan detective trench coat over a modest dark inner top (optionally topped with a tweed detective cap if fitting, or clean uncovered hair/hijab).',
        femaleNotes:
          '(A) If wearing hijab in IMAGE 1, keep a neat beige opaque hijab with full-length trench coat sleeves. (B) If hair is uncovered in IMAGE 1, preserve natural hair cleanly with glasses resting on head or worn, and full-length sleeves.',
      },
      {
        id: 'da_o3',
        name: 'Analytics Strategist Blazers & Vests',
        style: 'Smart-casual executive data attire',
        description:
          'FOR MEN / BOYS: Tailored navy-blue utility vest over a crisp white long-sleeve button-down shirt with gold growth-chart emblem and headphones around neck. FOR WOMEN / GIRLS: Sharp burgundy/maroon tailored blazer with gold trim and chart emblem over a beige shirt, OR navy tailored vest over a crisp white long-sleeve shirt.',
        femaleNotes:
          '(A) If wearing hijab in IMAGE 1, keep a coordinated beige opaque hijab with full-length blazer/shirt sleeves. (B) If hair is uncovered in IMAGE 1, preserve natural hair cleanly with full-length sleeves.',
      },
    ],
  },
  {
    id: 'ai_data_science',
    order: 3,
    nameEn: 'AI & Data Science',
    nameAr: 'الذكاء الاصطناعي وعلوم البيانات',
    taglineEn: 'Turn data into smart decisions',
    taglineAr: 'حوّل البيانات إلى قرارات ذكية',
    accent: '#3399FF',
    cardImage: 'assets/paths/ai-data-science.jpg',
    loadingBadgeEn: 'NEURAL NETWORK',
    loadingBadgeAr: 'الشبكة العصبية',
    loadingVideo: 'assets/loading/ai-neural.mp4',
    loadingTheme: 'neural',
    milestones: [
      { ar: 'نحلّل ملامحك', en: 'Analyzing your features' },
      { ar: 'نُوصل الشبكة العصبية', en: 'Connecting the neural network' },
      { ar: 'نُدرّب النموذج على صورتك', en: 'Training the model on you' },
      { ar: 'نولّد شخصيتك الذكية', en: 'Generating your AI persona' },
      { ar: 'صورتك جاهزة!', en: 'Your photo is ready!' },
    ],
    scenes: [
      {
        id: 'ai_v1',
        name: 'Climate & Cyclone AI Command',
        nameAr: 'مركز قيادة الذكاء الاصطناعي للمناخ',
        landmark: 'Meteorological AI Mission Control Room',
        description:
          'Photorealistic dark-blue AI mission control room with massive panoramic wall monitors displaying glowing satellite cyclone and heat-map visualizations, a sleek workstation desk with a laptop showing a glowing storm-track trajectory, a small glass globe, tablet, and notebook.',
        lighting:
          'Clean photorealistic editorial studio lighting with crisp cool-blue monitor ambient glow and natural skin tones.',
        poseDirective:
          'Solo guest: seated or leaning comfortably at the control desk beside the open laptop, resting hands naturally on the desk or holding a pen lightly while smiling at the camera. Group (2+ guests): gather behind the laptop desk in relaxed poses—one resting hands by a notebook, center guest seated comfortably behind the laptop, another leaning warmly with hand on chin—with no pointing.',
      },
      {
        id: 'ai_v2',
        name: 'Robotics & Neural Vision Lab',
        nameAr: 'مختبر الروبوتات والرؤية العصبية',
        landmark: 'Bright Futuristic AI Robotics Laboratory',
        description:
          'Clean, bright photorealistic AI robotics laboratory with glass partitions, a large background display showing a wireframe humanoid robot and performance graphs, a white articulated robotic arm picking up colored cubes (blue, red, green) on a glowing cyan target pad, a laptop displaying a glowing cyan wireframe brain, and a floating translucent cyan hologram.',
        lighting:
          'Bright, crisp daylight-balanced laboratory lighting with subtle cyan LED rim highlights.',
        poseDirective:
          'Solo guest: standing comfortably behind the robotics workbench with arms relaxed or holding a tablet naturally, smiling at the camera behind the robotic arm and floating cyan hologram. Group (2+ guests): stand side-by-side behind the workbench in relaxed poses—hands resting near the laptop, arms relaxed, or holding a tablet—with no pointing or reaching.',
      },
      {
        id: 'ai_v3',
        name: 'Smart Factory Computer Vision',
        nameAr: 'الرؤية الحاسوبية في المصانع الذكية',
        landmark: 'Automated Industrial AI Inspection Line',
        description:
          'Photorealistic high-tech automotive/industrial smart factory floor with orange robotic arms and a vehicle chassis softly blurred in the background, an illuminated optical inspection station in the foreground examining a precision metal gear, and a monitor displaying green computer-vision bounding-box detection.',
        lighting:
          'Crisp industrial studio lighting with cool overhead LEDs and subtle warm factory highlights in the background.',
        poseDirective:
          'Solo guest: standing beside the precision inspection station wearing clear safety glasses, holding a tablet or gently positioning the metal gear while smiling at the camera. Group (2+ guests): stand together behind the inspection monitor—one beside the screen, center guest holding a tablet, another wearing work gloves inspecting the metal gear.',
      },
    ],
    outfits: [
      {
        id: 'ai_o1',
        name: 'Mission Control Lab Attire',
        style: 'Photorealistic research & command wear',
        description:
          'FOR MEN / BOYS: Crisp navy utility overshirt over a light collared shirt with blue lanyard badge. FOR WOMEN / GIRLS: Crisp white research lab coat over a dark navy collared shirt with blue lanyard, OR navy utility jacket over white collared shirt.',
        femaleNotes:
          '(A) If wearing hijab in IMAGE 1, keep a neat sand-beige opaque hijab with full-length lab coat/jacket sleeves. (B) If hair is uncovered in IMAGE 1, preserve natural hair cleanly with full-length sleeves.',
      },
      {
        id: 'ai_o2',
        name: 'Robotics Lab Coats & Tech Jackets',
        style: 'Photorealistic robotics research attire',
        description:
          'FOR MEN / BOYS: Dark navy technical zip jacket over a crisp tee with blue lanyard and headphones around neck. FOR WOMEN / GIRLS: Clean white laboratory coat over a dark opaque top with blue lanyard.',
        femaleNotes:
          '(A) If wearing hijab in IMAGE 1, keep a neat sand-beige opaque hijab with full-length lab coat sleeves. (B) If hair is uncovered in IMAGE 1, preserve natural hair cleanly with full-length sleeves.',
      },
      {
        id: 'ai_o3',
        name: 'Smart Factory Safety Gear',
        style: 'Photorealistic industrial engineering uniform',
        description:
          'FOR MEN / BOYS & WOMEN / GIRLS: Dark charcoal-navy industrial engineering work jacket with silver reflective chest stripes, blue ID lanyard, and clear protective safety glasses (worn naturally without hiding eyes).',
        femaleNotes:
          '(A) If wearing hijab in IMAGE 1, keep a neat sand-beige opaque hijab tucked cleanly under the jacket collar with full-length sleeves and clear safety glasses. (B) If hair is uncovered in IMAGE 1, preserve natural hair cleanly with clear safety glasses and full-length sleeves.',
      },
    ],
  },
  {
    id: 'digital_arts',
    order: 4,
    nameEn: 'Digital Arts',
    nameAr: 'الفنون الرقمية',
    taglineEn: 'Create digital worlds from your imagination',
    taglineAr: 'اصنع عوالم رقمية من خيالك',
    accent: '#00FF99',
    cardImage: 'assets/paths/digital-arts.jpg',
    loadingBadgeEn: 'CREATIVE STUDIO',
    loadingBadgeAr: 'الاستوديو الإبداعي',
    loadingVideo: 'assets/loading/digital-arts.mp4',
    loadingTheme: 'digital_arts',
    milestones: [
      { ar: 'نلتقط ألوانك', en: 'Capturing your colors' },
      { ar: 'نرسم بالضوء', en: 'Painting with light' },
      { ar: 'ننحت عالمك ثلاثي الأبعاد', en: 'Sculpting your 3D world' },
      { ar: 'اللمسات الفنية الأخيرة', en: 'Final artistic touches' },
      { ar: 'صورتك جاهزة!', en: 'Your photo is ready!' },
    ],
    scenes: [
      {
        id: 'art_v1',
        name: 'Virtual Production LED Stage',
        nameAr: 'منصة الإنتاج الافتراضي',
        landmark: 'Curved LED Volume Fantasy Set',
        description:
          'Photorealistic virtual production soundstage with a massive curved LED wall displaying a luminous fantasy floating-island landscape with waterfalls and a ringed planet, overhead studio truss lighting, a floating holographic purple-tree island model in mid-air, and a digital pen display workstation.',
        lighting:
          'Cinematic studio key light mixed with vibrant magenta-and-cyan LED volume wall bounce.',
        poseDirective:
          'Solo guest: operating a compact cinema rig camera or sculpting the floating holographic 3D island with fingerless data-gloves while smiling toward the camera. Group (2+ guests): compose a dynamic trio—one holding the cinema camera rig, center guest in background sculpting the holographic floating island with both hands, another sketching on the pen display.',
      },
      {
        id: 'art_v2',
        name: 'Motion Capture Stage',
        nameAr: 'مسرح التقاط الحركة',
        landmark: 'Full-Body MoCap Soundstage',
        description:
          'Photorealistic dark motion-capture studio stage with truss-mounted red-ring optical tracking cameras, reflective floor grid, and a huge rear LED screen showing a vibrant 3D video game scene populated by stylized 3D game-hero avatars that directly resemble the exact participant(s) from IMAGE 1 (matching their facial likeness, hair/hijab, glasses, and exact headcount—1 avatar for a solo guest, or matching 2+ avatars for a group) mirroring their live MoCap poses in futuristic game armor.',
        lighting:
          'Dramatic editorial stage lighting with magenta and electric-blue floor reflections and crisp front fill on faces.',
        poseDirective:
          'Solo guest: standing full-body in a dynamic action pose (heroic energy palm or bow-and-arrow stance) facing the camera with an excited smile. Group (2+ guests): stand side-by-side in synchronized heroic MoCap poses—left guest extending an open palm, center guest drawing an imaginary bow, right guest in a dynamic combat-ready stance.',
      },
      {
        id: 'art_v3',
        name: '3D Character Sculpting Atelier',
        nameAr: 'مرسم النحت ثلاثي الأبعاد',
        landmark: 'Digital Character Concept & Sculpting Studio',
        description:
          'Warm-lit photorealistic digital art studio with a large background monitor showing a 3D character turnaround sheet (colored render + grey clay sculpts), shelves of character figurines, large angled pen-display monitors showing greyscale 3D bust sculpting and character painting, plus sketchbooks and brushes on the desk.',
        lighting:
          'Warm studio tungsten key light balanced with subtle violet and cyan ambient studio accents.',
        poseDirective:
          'Solo guest: seated or standing at the digital sculpting workstation holding a stylus on the pen display or presenting a grey clay character maquette on a turntable. Group (2+ guests): foreground guest sculpting on the pen display with stylus, center standing guest proudly holding the clay character maquette, third guest painting on a secondary pen display.',
      },
    ],
    outfits: [
      {
        id: 'art_o1',
        name: 'Virtual Production Crew Jumpsuits',
        style: 'Technical film & VFX crew attire',
        description:
          'FOR MEN / BOYS & WOMEN / GIRLS: Sleek dark-charcoal technical utility jumpsuit/jacket with subtle yellow or cyan seam accents, utility belt, fingerless tech gloves, and optional headphones around neck.',
        femaleNotes:
          '(A) If wearing hijab in IMAGE 1, keep a neat sand-beige opaque hijab with full-length jumpsuit sleeves. (B) If hair is uncovered in IMAGE 1, preserve natural hair cleanly with full-length sleeves.',
      },
      {
        id: 'art_o2',
        name: 'Motion Capture Tracking Suits',
        style: 'Relaxed oversized MoCap studio tracksuit',
        description:
          'FOR MEN / BOYS & WOMEN / GIRLS: Loose, boxy-fit, relaxed-oversized dark-charcoal motion-capture tracksuit (roomy zip-up jacket/windbreaker + wide-leg relaxed cargo joggers + dark sneakers)—never tight, fitted, or body-hugging—adorned with white tracking seam lines, utility belt, and silver reflective MoCap marker spheres on shoulders, sleeves, and trousers.',
        femaleNotes:
          '(A) If wearing hijab in IMAGE 1, keep a neat sand-beige opaque hijab and ensure the MoCap tracksuit is loose, boxy, non-clinging, and full-length. (B) If hair is uncovered in IMAGE 1, preserve natural hair cleanly with the same loose, relaxed-fit MoCap tracksuit.',
      },
      {
        id: 'art_o3',
        name: '3D Sculptor Leather Aprons',
        style: 'Artisan digital sculptor studio wear',
        description:
          'FOR MEN / BOYS & WOMEN / GIRLS: Dark charcoal knit sweater or hoodie layered under a rugged dark-brown leather/waxed-canvas artist apron with brass buckles and brush/stylus pockets.',
        femaleNotes:
          '(A) If wearing hijab in IMAGE 1, keep a neat sand-beige opaque hijab with full-length dark sweater sleeves under the apron. (B) If hair is uncovered in IMAGE 1, preserve natural hair cleanly with full-length sleeves.',
      },
    ],
  },
  {
    id: 'cybersecurity',
    order: 5,
    nameEn: 'Infrastructure & Cybersecurity',
    nameAr: 'البنية التحتية والأمن السيبراني',
    taglineEn: 'Protect the systems that run the future',
    taglineAr: 'احمِ الأنظمة التي تشغّل المستقبل',
    accent: '#3399FF',
    cardImage: 'assets/paths/cybersecurity.jpg',
    loadingBadgeEn: 'ENCRYPTION MODE',
    loadingBadgeAr: 'وضع التشفير',
    loadingTheme: 'cybersecurity',
    milestones: [
      { ar: 'التحقق من الهوية', en: 'Verifying identity' },
      { ar: 'تشفير ملامحك', en: 'Encrypting your features' },
      { ar: 'بناء درعك الرقمي', en: 'Building your digital shield' },
      { ar: 'تأمين صورتك النهائية', en: 'Securing your final image' },
      { ar: 'صورتك جاهزة!', en: 'Your photo is ready!' },
    ],
    scenes: [
      {
        id: 'sec_v1',
        name: 'Cloud & Fiber Server Vault',
        nameAr: 'قبو السحابة والألياف الضوئية',
        landmark: 'Glowing Blue & Violet Hyperscale Data Center',
        description:
          'Photorealistic hyperscale data center aisle lined with towering illuminated server racks, a large glowing cyan holographic cloud-with-servers icon floating overhead with light-beam data lines feeding into the racks, foreground network switches with glowing blue fiber-optic patch cables, and a translucent cyan cloud-upload hologram panel.',
        lighting:
          'Clean editorial studio key light on faces contrasted with deep cobalt-blue and electric-violet server rack illumination.',
        poseDirective:
          'Solo guest: standing comfortably beside the illuminated foreground server rack with hands relaxed or resting lightly on the rack edge, smiling at the camera while glowing blue fiber cables and the cyan cloud hologram shine nearby. Group (2+ guests): stand behind the foreground switches in relaxed, confident poses—arms lightly folded, holding a server module, or resting hands near the rack—with no pointing or tapping.',
      },
      {
        id: 'sec_v2',
        name: 'Cyber Defense Shield Arena',
        nameAr: 'ساحة الدرع السيبراني',
        landmark: 'Holographic Cyber-Fortress Battleground',
        description:
          'Dramatic neon-lit cyber defense arena: a shadowy hooded red-eyed digital threat silhouette looms in the distant dark-red background surrounded by red pixel-bug alert windows, while a glowing cyan holographic fortress wall and circular server cluster stand protected in the foreground.',
        lighting:
          'High-contrast cinematic lighting: bright crisp front light on faces, cool cyan holographic shield glow from the foreground, and dramatic red rim accents from behind.',
        poseDirective:
          'Solo guest: standing confidently behind the glowing cyan server fortress, projecting a translucent glowing cyan hexagonal padlock shield with one hand toward the camera. Group (2+ guests): stand side-by-side behind the cyber fortress—left guest projecting a glowing cyan padlock shield, center guest extending a protective hand over the holographic castle, right guest projecting a circular cyber-lock hologram.',
      },
    ],
    outfits: [
      {
        id: 'sec_o1',
        name: 'Cloud Infrastructure Tech Jackets',
        style: 'Tactical data-center engineering jacket',
        description:
          'FOR MEN / BOYS & WOMEN / GIRLS: Sleek dark-charcoal technical zip jacket with subtle glowing cyan seam accents and glowing cyan cloud/server shoulder patches over a dark opaque inner shirt.',
        femaleNotes:
          '(A) If wearing hijab in IMAGE 1, keep a neat off-white/beige opaque hijab with full-length jacket sleeves. (B) If hair is uncovered in IMAGE 1, preserve natural hair cleanly with full-length sleeves.',
      },
      {
        id: 'sec_o2',
        name: 'Cyber Guardian Armored Jackets',
        style: 'Futuristic cyber-defense tactical coat',
        description:
          'FOR MEN / BOYS & WOMEN / GIRLS: Structured dark-navy cyber-defense armored tech jacket with subtle metallic/cyan piping, utility belt, and glowing cyan padlock shoulder emblem over a dark opaque inner top.',
        femaleNotes:
          '(A) If wearing hijab in IMAGE 1, keep a neat off-white/beige opaque hijab with full-length opaque sleeves. (B) If hair is uncovered in IMAGE 1, preserve natural hair cleanly with full-length sleeves.',
      },
    ],
  },
];

export function getPathById(id: string | null | undefined): LearningPathConfig {
  return LEARNING_PATHS.find((p) => p.id === id) || LEARNING_PATHS[2];
}
