/*
 * Browny – ngân hàng câu hỏi TOEFL ITP Section 2 (Structure & Written Expression)
 *
 * TRẠNG THÁI: BẢN NHÁP DO AI SOẠN – CẦN GIÁO VIÊN DUYỆT TRƯỚC KHI PHÁT HÀNH.
 *
 * Cách soạn:
 *  - Format, số câu, thời gian và cách ra đề lấy theo TOEFL ITP Test Taker Handbook (ETS)
 *    và bộ Official Practice Test Level 1 Vol. 3 (ETS): Structure = câu chưa hoàn chỉnh + 4 lựa chọn,
 *    Written Expression = 4 phần gạch chân, chọn phần phải sửa; Level 1 có 40 câu / 25 phút.
 *  - Danh sách điểm ngữ pháp và các dạng lỗi hay gặp tổng hợp từ tài liệu "TOEFL Grammar"
 *    và "Error Checking Part 1.1" do người dùng cung cấp, cùng nhóm kỹ năng quen thuộc của sách Longman.
 *  - TẤT CẢ câu hỏi bên dưới là câu mới, không chép hay chỉnh sửa từ câu hỏi trong các tài liệu trên.
 *
 * Định dạng:
 *  S(id, station, level, topic, "câu có _____", [4 lựa chọn], "đáp án A-D", "giải thích")
 *  W(id, station, level, topic, "câu có [4] [phần] [gạch] [chân]", "đáp án A-D", "giải thích")
 *  level: 1 = dễ, 2 = trung bình, 3 = khó
 */
(function () {
  const L = 'ABCD';
  const questions = [];
  function S(id, station, level, topic, text, options, ans, explain) {
    questions.push({ id, station, level, kind: 'Structure', topic, text, options, answer: L.indexOf(ans), explain, review: 'ai-draft' });
  }
  function W(id, station, level, topic, sentence, ans, explain) {
    const parts = sentence.split(/\[([^\]]+)\]/);
    const segs = []; let n = 0;
    parts.forEach((p, i) => {
      if (i % 2 === 1) segs.push([p, L[n++]]);
      else if (p) segs.push(p);
    });
    if (n !== 4) throw new Error('Câu ' + id + ' phải có đúng 4 phần gạch chân');
    questions.push({ id, station, level, kind: 'Written Expression', topic, segs, options: ['A', 'B', 'C', 'D'], answer: L.indexOf(ans), explain, review: 'ai-draft' });
  }

  /* ---------- Trạm 1: Chủ ngữ, động từ và liên từ ---------- */
  S('s1a', 1, 1, 'Thiếu chủ ngữ và động từ',
    'In 1915, _____ the first transcontinental telephone call in the United States.',
    ['completed engineers', 'engineers completed', 'engineers completing', 'the completion by engineers'], 'B',
    'Câu chưa có chủ ngữ và động từ chính. Chỉ có "engineers completed" cung cấp đủ cả hai. "Engineers completing" dùng V-ing nên không có động từ chính, còn "the completion by engineers" chỉ là cụm danh từ.');
  S('s1b', 1, 1, 'Thiếu động từ chính',
    'The Great Lakes _____ about one fifth of the world\'s fresh surface water.',
    ['containing', 'to contain', 'contain', 'which contain'], 'C',
    'Chủ ngữ "The Great Lakes" cần một động từ chia thì. "Containing" và "to contain" không phải động từ chính; "which contain" biến phần sau thành mệnh đề quan hệ nên câu vẫn thiếu động từ.');
  S('s1c', 1, 2, 'Because / Because of',
    '_____ honey contains very little water, it can stay edible for thousands of years.',
    ['Because of', 'Because', 'Despite', 'In spite'], 'B',
    'Phía sau là một mệnh đề đầy đủ (honey contains...), nên cần liên từ "Because". "Because of" và "Despite" chỉ đi với danh từ; "In spite" thiếu "of" và cũng sai nghĩa.');
  S('s1d', 1, 2, 'Liên từ nối mệnh đề',
    'Sea otters can float on their backs for hours _____ their thick fur traps a layer of air.',
    ['since', 'due to', 'owing', 'as a result of'], 'A',
    '"Their thick fur traps..." là mệnh đề có chủ ngữ và động từ, nên cần liên từ "since" (vì). "Due to" và "as a result of" là giới từ, chỉ đi với danh từ.');
  W('s1e', 1, 2, 'Thừa liên từ',
    'Although [the cactus] [stores] water in its stem, [but it] can still die [during] a long drought.', 'C',
    '"Although" đã nối hai mệnh đề, không dùng thêm "but". Sửa: "Although the cactus stores water..., it can still die..."');
  W('s1f', 1, 1, 'Thừa chủ ngữ',
    'The violin, [which] [has] four [strings], [it is] usually played with a bow.', 'D',
    'Chủ ngữ là "The violin". Thêm "it" là lặp chủ ngữ. Sửa: "The violin, which has four strings, is usually played with a bow."');

  /* ---------- Trạm 2: Mệnh đề quan hệ và rút gọn ---------- */
  S('s2a', 2, 2, 'Mệnh đề quan hệ',
    'Jazz, a musical style _____ in New Orleans, blends African and European traditions.',
    ['originated', 'that originated', 'it originated', 'was originated'], 'B',
    'Cần mệnh đề quan hệ bổ nghĩa cho "a musical style": "that originated". "Originate" là nội động từ nên không rút gọn thành "originated" kiểu bị động được, và cũng không có dạng "was originated".');
  S('s2b', 2, 2, 'Whose',
    'The hummingbird, _____ wings can beat more than fifty times per second, is able to hover in midair.',
    ['its', 'which', 'whose', 'that its'], 'C',
    'Cần đại từ quan hệ chỉ sở hữu đứng trước danh từ "wings": "whose wings" (đôi cánh của nó). "Its" không nối được mệnh đề; "which" không đứng trước danh từ như vậy.');
  S('s2c', 2, 2, 'Đồng vị ngữ',
    'Mount Rainier, _____, is an active volcano in Washington State.',
    ['is the highest peak in the Cascade Range', 'the highest peak in the Cascade Range', 'which the highest peak in the Cascade Range', 'it is the highest peak in the Cascade Range'], 'B',
    'Giữa hai dấu phẩy là đồng vị ngữ (một cụm danh từ giải thích cho chủ ngữ). Câu đã có động từ "is", nên chỗ trống không được thêm động từ. Phương án có "which" lại thiếu động từ sau "which".');
  S('s2d', 2, 3, 'Rút gọn mệnh đề quan hệ',
    'Scientists _____ the behavior of whales often use underwater microphones.',
    ['study', 'are studying', 'studying', 'who they study'], 'C',
    '"Studying" là dạng rút gọn của "who study" (chủ động). "Study" và "are studying" tạo ra hai động từ chính trong một câu; "who they study" thừa "they".');
  W('s2e', 2, 2, 'Whom / Whose',
    'Amelia Earhart was a pilot [whom] [achievements] [inspired] many women [to pursue] careers in aviation.', 'A',
    'Đứng trước danh từ "achievements" để chỉ sở hữu phải dùng "whose" (những thành tựu của bà). "Whom" là tân ngữ, không đứng trước danh từ.');
  W('s2f', 2, 3, 'Which / That',
    'The Rocky Mountains, [that] [stretch] more than 3,000 miles, [extend] from Canada [to] New Mexico.', 'A',
    'Mệnh đề quan hệ có dấu phẩy (không xác định) không dùng "that". Sửa thành "which stretch".');

  /* ---------- Trạm 3: Hoà hợp chủ ngữ – động từ và thì ---------- */
  W('s3a', 3, 2, 'The number of',
    '[The number of] [students] [studying] abroad [have increased] steadily in recent years.', 'D',
    '"The number of + danh từ số nhiều" là chủ ngữ số ít, nên phải dùng "has increased". Cẩn thận phân biệt với "A number of" (số nhiều).');
  W('s3b', 3, 1, 'Each of',
    '[Each] of the [planets] [in] our solar system [travel] around the Sun in an elliptical orbit.', 'D',
    'Chủ ngữ là "Each" (số ít), không phải "planets". Sửa thành "travels".');
  S('s3c', 3, 1, 'There is / There are',
    'There _____ several theories about why the dinosaurs became extinct.',
    ['is', 'are', 'has', 'being'], 'B',
    'Sau "there", động từ hoà hợp với danh từ đứng sau nó: "several theories" là số nhiều nên dùng "are".');
  W('s3d', 3, 1, 'Thì quá khứ',
    'In 1849, thousands of people [travel] to California [because] gold [had been discovered] [there].', 'A',
    'Mốc "In 1849" là quá khứ, nên động từ chính phải là "traveled". "Had been discovered" đúng vì việc tìm ra vàng xảy ra trước đó.');
  S('s3e', 3, 2, 'Neither ... nor',
    'Neither the professor nor the students _____ aware of the schedule change.',
    ['was', 'were', 'has been', 'being'], 'B',
    'Với "neither ... nor", động từ hoà hợp với chủ ngữ gần nhất là "the students" (số nhiều), nên dùng "were".');
  W('s3f', 3, 3, 'Chủ ngữ bị ngăn cách',
    'The [results] of the experiment, [which lasted] three years, [was published] [in] a scientific journal.', 'C',
    'Chủ ngữ thật là "The results" (số nhiều). Cụm "of the experiment" và mệnh đề "which lasted three years" chỉ là phần chen giữa. Sửa thành "were published".');

  /* ---------- Trạm 4: Dạng từ ---------- */
  W('s4a', 4, 1, 'Danh từ / Tính từ',
    '[Rainforests] [are] [extremely] [importance] to the global climate.', 'D',
    'Sau "are extremely" cần tính từ: "important". "Importance" là danh từ.');
  W('s4b', 4, 2, 'Tính từ / Trạng từ',
    'The Hubble Space Telescope has [provided] [remarkably] [clearly] images of [distant] galaxies.', 'C',
    'Đứng trước danh từ "images" phải là tính từ: "clear". "Remarkably" là trạng từ bổ nghĩa cho "clear" nên đúng.');
  W('s4c', 4, 1, 'Trạng từ bổ nghĩa động từ',
    'Bamboo grows [rapid] and can [reach] its [full] height [within] a few months.', 'A',
    '"Grows" là động từ thường, cần trạng từ bổ nghĩa: "rapidly".');
  S('s4d', 4, 1, 'Danh từ sau mạo từ',
    'The _____ of the transcontinental railroad in 1869 transformed trade in the United States.',
    ['complete', 'completely', 'completion', 'completed'], 'C',
    'Sau "The" và trước "of" cần một danh từ làm chủ ngữ: "completion" (sự hoàn thành).');
  W('s4e', 4, 2, 'Trạng từ bổ nghĩa tính từ',
    'Benjamin Banneker was a self-taught [mathematician] [whose] [astronomical] calculations were [remarkable] accurate.', 'D',
    'Bổ nghĩa cho tính từ "accurate" phải là trạng từ: "remarkably accurate".');
  W('s4f', 4, 2, 'Động từ / Danh từ',
    'The [discover] of penicillin [in] 1928 [changed] the [practice] of medicine.', 'A',
    'Sau "The" và trước "of" cần danh từ: "discovery". "Discover" là động từ.');

  /* ---------- Trạm 5: Danh từ, đại từ, mạo từ và lượng từ ---------- */
  W('s5a', 5, 1, 'Many / Much',
    '[Much] of the [animals] in the Arctic [have] thick fur [to stay] warm.', 'A',
    '"Animals" là danh từ đếm được số nhiều, phải dùng "Many". "Much" chỉ đi với danh từ không đếm được.');
  W('s5b', 5, 1, 'Danh từ số nhiều',
    'The giant panda feeds [almost] [entirely] on bamboo, [eating] up to forty [pound] of it each day.', 'D',
    'Sau số "forty", danh từ đếm được phải ở số nhiều: "pounds".');
  W('s5c', 5, 2, 'Danh từ không đếm được',
    'When beavers build a dam, [they use] branches, mud, and stones [to block] [the flow of] [a water].', 'D',
    '"Water" là danh từ không đếm được, không dùng "a". Sửa thành "the flow of water" hoặc "the flow of the water".');
  S('s5d', 5, 2, 'Lượng từ',
    '_____ of the colonists at Jamestown died during the harsh winter of 1609–1610.',
    ['Many', 'Much', 'A great deal', 'Every'], 'A',
    '"Colonists" là danh từ đếm được số nhiều, nên dùng "Many of". "Much" và "a great deal" dùng cho danh từ không đếm được; "Every" không đi với "of the".');
  W('s5e', 5, 2, 'Mạo từ "the"',
    'The Statue of Liberty was a gift [from] the people of France [to] the people of [United States] [in] 1886.', 'C',
    'Tên nước có dạng liên bang hoặc số nhiều cần "the": "the United States".');
  W('s5f', 5, 1, 'Đại từ phải khớp số',
    'Octopuses can change the color of [its] skin [in less than] [a second] [to hide] from predators.', 'A',
    '"Octopuses" là số nhiều, nên tính từ sở hữu phải là "their".');

  /* ---------- Trạm 6: Cấu trúc song song và so sánh ---------- */
  W('s6a', 6, 2, 'Cấu trúc song song',
    'Thomas Jefferson was [a statesman], an architect, and [an invent] [who designed] many devices [for] his home.', 'B',
    'Ba thành phần nối bằng "and" phải cùng là danh từ chỉ người: a statesman, an architect, and an inventor. "Invent" là động từ.');
  S('s6b', 6, 1, 'So sánh nhất',
    'The cheetah is _____ land animal in the world.',
    ['fastest', 'the fastest', 'faster', 'the most fast'], 'B',
    'So sánh nhất với tính từ ngắn: "the + adj-est". "In the world" là dấu hiệu so sánh nhất.');
  W('s6c', 6, 1, 'So sánh hơn',
    'Gold is [more heavier] [than] silver, [but] silver is [a better] conductor of electricity.', 'A',
    'Tính từ ngắn so sánh hơn chỉ thêm "-er": "heavier". Không dùng "more" cùng với "-er".');
  S('s6d', 6, 2, 'So sánh kép',
    'The higher a climber goes, _____ the air becomes.',
    ['the thinner', 'thinner', 'the thin', 'more thinner'], 'A',
    'Cấu trúc "The + so sánh hơn ..., the + so sánh hơn ...". Vế sau cũng phải có "the thinner".');
  W('s6e', 6, 2, 'Song song với to-infinitive',
    'Students in the program learn [to read] maps, [collecting] soil samples, and [to analyze] [weather] data.', 'B',
    'Sau "learn" là chuỗi to-infinitive: to read, to collect, and to analyze. "Collecting" phá vỡ cấu trúc song song.');
  S('s6f', 6, 3, 'So sánh bội số',
    'Jupiter\'s diameter is about eleven times _____ Earth\'s.',
    ['as large as', 'as large than', 'larger as', 'so large as'], 'A',
    'So sánh gấp nhiều lần dùng "số lần + as + adj + as". Không ghép "as" với "than".');

  /* ---------- Trạm 7: Đảo ngữ và lỗi thừa ---------- */
  S('s7a', 7, 3, 'Đảo ngữ với Only after',
    'Only after the invention of the telescope _____ the moons of Jupiter.',
    ['astronomers could see', 'could astronomers see', 'astronomers seeing', 'did astronomers could see'], 'B',
    'Câu mở đầu bằng "Only after + cụm từ" phải đảo trợ động từ lên trước chủ ngữ: "could astronomers see".');
  S('s7b', 7, 2, 'Đảo ngữ với Rarely',
    'Rarely _____ snow in the southern part of Florida.',
    ['there is', 'is there', 'does there', 'there has'], 'B',
    'Trạng từ phủ định "Rarely" đứng đầu câu thì đảo ngữ: "is there snow".');
  W('s7c', 7, 2, 'Thừa liên từ',
    'Because the river [flooded] [every] [spring], [so] the early settlers built their homes on higher ground.', 'D',
    'Hai mệnh đề chỉ cần một liên từ. Đã có "Because" thì bỏ "so".');
  W('s7d', 7, 1, 'Thừa từ',
    'After the Olympic Games, [the] athletes [returned back] [to] their [home] cities.', 'B',
    '"Return" đã có nghĩa là quay lại, thêm "back" là thừa. Sửa thành "returned".');
  S('s7e', 7, 3, 'Đảo ngữ với So + tính từ',
    'So strong _____ that it uprooted hundreds of trees.',
    ['the wind was', 'was the wind', 'the wind', 'did the wind'], 'B',
    '"So + tính từ" đứng đầu câu thì đảo động từ "to be" lên trước chủ ngữ: "So strong was the wind that...".');
  W('s7f', 7, 3, 'Hardly ... when',
    'Hardly [had] the concert [begun] [than] the power [went out].', 'C',
    'Cấu trúc đúng là "Hardly ... when" hoặc "No sooner ... than". Sửa "than" thành "when".');

  /* ================= Bổ sung đợt 2 ================= */

  /* Trạm 1 */
  S('s1g', 1, 1, 'Câu bị động thiếu động từ',
    'The Library Company of Philadelphia _____ in 1731 by Benjamin Franklin and a group of friends.',
    ['was founded', 'founded', 'founding', 'it was founded'], 'A',
    'Thư viện được thành lập (bị động) và câu đang thiếu động từ chính, nên chọn "was founded". "Founded" mang nghĩa chủ động (thư viện tự thành lập ai đó); "it was founded" thừa chủ ngữ "it".');
  S('s1h', 1, 2, 'Liên từ tương phản',
    '_____ most birds build their nests in trees, some species nest on the ground.',
    ['While', 'Despite', 'Because of', 'During'], 'A',
    'Phía sau là mệnh đề đầy đủ và hai vế trái ngược nhau, nên cần liên từ "While" (trong khi). "Despite, because of, during" là giới từ, chỉ đi với danh từ.');
  W('s1i', 1, 2, 'Hai động từ, thiếu từ nối',
    'The giraffe [has] a long neck [allows] it [to reach] leaves [high] in trees.', 'B',
    'Câu có hai động từ chính "has" và "allows" mà không có từ nối. Sửa thành "which allows" (hoặc "that allows").');
  W('s1j', 1, 3, 'Động từ trong mệnh đề phụ',
    'Coffee plants [grow] best in regions [where] temperatures [remaining] mild [throughout] the year.', 'C',
    'Mệnh đề "where temperatures ..." cần động từ chia thì: "remain". V-ing không làm động từ chính được.');

  /* Trạm 2 */
  S('s2g', 2, 2, 'Rút gọn bị động',
    'The Smithsonian Institution, _____ in 1846, operates museums and research centers in Washington, D.C.',
    ['founded', 'was founded', 'which founded', 'it was founded'], 'A',
    '"Founded in 1846" là dạng rút gọn của "which was founded in 1846" (bị động). "Was founded" và "it was founded" thêm một động từ chính thứ hai; "which founded" mang nghĩa chủ động, sai nghĩa.');
  S('s2h', 2, 1, 'Who làm chủ ngữ',
    'The physician _____ the first successful vaccine was Edward Jenner.',
    ['developed', 'who developed', 'whom developed', 'he developed'], 'B',
    'Cần mệnh đề quan hệ bổ nghĩa cho "The physician" và làm chủ ngữ của "developed": "who developed". "Whom" là tân ngữ.');
  W('s2i', 2, 1, 'Who / Which',
    'The Wright brothers, [which] [owned] a bicycle shop, [built] their first airplane [in] Ohio.', 'A',
    '"The Wright brothers" là người, nên dùng "who", không dùng "which".');
  W('s2j', 2, 3, 'Thừa đại từ sau mệnh đề quan hệ',
    'The town [in which] Mark Twain grew up [it] [inspired] many of [his] stories.', 'B',
    'Chủ ngữ là "The town" (đã được bổ nghĩa bởi "in which Mark Twain grew up"). Thêm "it" là lặp chủ ngữ.');

  /* Trạm 3 */
  W('s3g', 3, 2, 'A number of',
    'A number of [scientists] [believes] that [the climate] [is changing] rapidly.', 'B',
    '"A number of + danh từ số nhiều" mang nghĩa "nhiều", đi với động từ số nhiều: "believe".');
  S('s3h', 3, 2, 'Danh từ tận cùng -s nhưng số ít',
    'Mathematics _____ a required subject in most American high schools.',
    ['is', 'are', 'have been', 'being'], 'A',
    'Tên môn học như mathematics, physics, economics tuy có "-s" nhưng là số ít, nên dùng "is".');
  W('s3i', 3, 2, 'Quá khứ hoàn thành',
    'By the time the settlers [reached] Oregon, [most of] their supplies [has] [run out].', 'C',
    '"By the time + quá khứ đơn" thì hành động xảy ra trước đó dùng quá khứ hoàn thành: "had run out".');
  W('s3j', 3, 3, 'Every one of',
    'Every one of the [paintings] in the exhibition [were] [created] [by] local artists.', 'B',
    'Chủ ngữ là "Every one" (số ít), không phải "paintings". Sửa thành "was created".');

  /* Trạm 4 */
  W('s4g', 4, 2, 'Danh từ / Tính từ',
    'The Grand Canyon is [famous] for its [beauty] and its [geology] [importance].', 'C',
    'Bổ nghĩa cho danh từ "importance" cần tính từ: "geological". "Geology" là danh từ.');
  S('s4h', 4, 2, 'Danh từ song song',
    'Dolphins are known for their _____ and playful behavior.',
    ['intelligent', 'intelligence', 'intelligently', 'intelligentness'], 'B',
    'Sau "their" cần danh từ, và nó được nối với cụm danh từ "playful behavior" bằng "and": "intelligence". "Intelligentness" không phải từ chuẩn.');
  W('s4i', 4, 1, 'Trạng từ bổ nghĩa tính từ',
    'Monarch butterflies [travel] [incredible] long distances [during] their [annual] migration.', 'B',
    'Bổ nghĩa cho tính từ "long" phải là trạng từ: "incredibly long".');
  W('s4j', 4, 2, 'Trạng từ bổ nghĩa động từ',
    'The [economic] growth of the region [depended] [heavy] on the [fishing] industry.', 'C',
    'Bổ nghĩa cho động từ "depended" cần trạng từ: "heavily".');

  /* Trạm 5 */
  W('s5g', 5, 1, 'Each + danh từ số ít',
    '[Each] [students] in the class [must submit] [a] research paper.', 'B',
    '"Each" đi với danh từ số ít: "Each student".');
  S('s5h', 5, 1, 'Little / Few',
    'There is _____ reliable information about the early history of the island.',
    ['little', 'few', 'a few', 'many'], 'A',
    '"Information" là danh từ không đếm được, nên dùng "little". "Few, a few, many" chỉ đi với danh từ đếm được số nhiều.');
  W('s5i', 5, 2, 'Danh từ không đếm được',
    'Scientists [have found] [an evidence] [of] water [on] Mars.', 'B',
    '"Evidence" là danh từ không đếm được, không dùng "an". Sửa thành "evidence" hoặc "a piece of evidence".');
  W('s5j', 5, 3, 'Đại từ phải khớp số',
    '[The] bald eagle and [the] golden eagle [differ] in [its] diet and nesting habits.', 'D',
    'Chủ ngữ gồm hai loài nối bằng "and" là số nhiều, nên dùng "their".');

  /* Trạm 6 */
  S('s6g', 6, 2, 'Than any other',
    'The Nile is longer _____ in Africa.',
    ['than any other river', 'than any river other', 'any other river than', 'than other rivers any'], 'A',
    'Cấu trúc so sánh hơn với tất cả phần còn lại: "longer than any other + danh từ số ít".');
  W('s6h', 6, 2, 'So sánh và song song',
    'The new library is [bigger], [brighter], and [more comfortably] [than] the old one.', 'C',
    'Sau "is" cần tính từ, và phải cùng dạng với "bigger, brighter": "more comfortable".');
  W('s6i', 6, 2, 'As ... as',
    '[Hiking] in the [mountains] [is] as enjoyable [than] swimming in the ocean.', 'D',
    'So sánh bằng dùng "as ... as": "as enjoyable as". Không dùng "than".');
  S('s6j', 6, 3, 'Song song với V-ing',
    'Reading novels, _____, and writing poetry were her favorite activities.',
    ['to paint landscapes', 'painting landscapes', 'she painted landscapes', 'landscapes painted'], 'B',
    'Hai thành phần còn lại là V-ing (reading, writing), nên chỗ trống cũng phải là "painting landscapes".');

  /* Trạm 7 */
  S('s7g', 7, 3, 'Đảo ngữ với Not until',
    'Not until 1920 _____ the right to vote in national elections in the United States.',
    ['women gained', 'did women gain', 'women did gain', 'gained women'], 'B',
    '"Not until + mốc thời gian" đứng đầu câu thì đảo trợ động từ: "did women gain".');
  S('s7h', 7, 2, 'Đảo ngữ với Seldom',
    'Seldom _____ such a large crowd at the town festival.',
    ['we have seen', 'have we seen', 'we saw', 'seen we have'], 'B',
    '"Seldom" đứng đầu câu thì đảo trợ động từ lên trước chủ ngữ: "have we seen".');
  W('s7i', 7, 1, 'Thừa từ',
    'The [annual] festival [is held] [every year] [in] October.', 'C',
    '"Annual" đã có nghĩa là hằng năm, thêm "every year" là thừa. Bỏ "every year".');
  S('s7j', 7, 3, 'No sooner ... than',
    'No sooner _____ the stage than the audience began to cheer.',
    ['the singer had reached', 'had the singer reached', 'the singer reached', 'did the singer reached'], 'B',
    '"No sooner" đứng đầu câu thì đảo trợ động từ: "No sooner had the singer reached ... than ...".');

  /* ---------- Trạm 8: Động từ (bị động, V-ing / to V) ---------- */
  W('s8a', 8, 1, 'Bị động: be + V3',
    'The Declaration of Independence [was] [sign] [in] Philadelphia [in] 1776.', 'B',
    'Câu bị động cần "be + V3": "was signed".');
  S('s8b', 8, 1, 'Enjoy + V-ing',
    'Many people enjoy _____ the night sky with a telescope.',
    ['to observe', 'observing', 'observe', 'observed'], 'B',
    'Sau "enjoy" dùng V-ing: "enjoy observing".');
  S('s8c', 8, 1, 'Decide + to V',
    'The students decided _____ a garden behind the school.',
    ['planting', 'to plant', 'plant', 'planted'], 'B',
    'Sau "decide" dùng to-infinitive: "decided to plant".');
  W('s8d', 8, 2, 'Giới từ + V-ing',
    'Penguins [are] birds [that] cannot fly, but they are [excellent] at [swim].', 'D',
    'Sau giới từ "at" phải là danh từ hoặc V-ing: "at swimming".');
  S('s8e', 8, 3, 'Bị động tiếp diễn',
    'The bridge _____ when the earthquake struck.',
    ['was being repaired', 'was repairing', 'is repaired', 'repaired'], 'A',
    'Cây cầu đang được sửa (bị động) vào lúc động đất xảy ra (quá khứ), nên dùng quá khứ tiếp diễn bị động: "was being repaired".');
  W('s8f', 8, 2, 'Make + V nguyên mẫu',
    'The teacher made the students [to rewrite] [their] essays [before] the [final] deadline.', 'A',
    '"Make somebody do something": sau "make" dùng động từ nguyên mẫu không "to". Sửa thành "rewrite".');
  S('s8g', 8, 1, 'Bị động hiện tại',
    'Bread _____ from flour, water, and yeast.',
    ['makes', 'is made', 'making', 'has made'], 'B',
    'Bánh mì được làm từ nguyên liệu (bị động), sự thật chung nên dùng hiện tại đơn: "is made".');
  W('s8h', 8, 3, 'Rút gọn bị động',
    'Large amounts of rain [are needed] [to support] the [rich] plant life [finding] in rainforests.', 'D',
    'Thực vật "được tìm thấy" (bị động), nên dạng rút gọn phải là V3: "found in rainforests".');

  /* ---------- Trạm 9: Phân từ và mệnh đề danh từ ---------- */
  S('s9a', 9, 2, 'Cụm phân từ V3 đầu câu',
    '_____ in the Andes Mountains, Lake Titicaca is one of the highest navigable lakes in the world.',
    ['Located', 'It is located', 'Locating', 'Is located'], 'A',
    'Hồ "được đặt ở" dãy Andes (bị động), dạng rút gọn đầu câu là "Located". "It is located" tạo hai mệnh đề không có liên từ; "Is located" thiếu chủ ngữ.');
  S('s9b', 9, 2, 'Cụm phân từ V-ing đầu câu',
    '_____ the map carefully, the hikers chose the safest route.',
    ['Studying', 'Studied', 'They studied', 'To be studied'], 'A',
    'Những người leo núi tự xem bản đồ (chủ động), nên dùng "Studying". "They studied" tạo hai mệnh đề mà không có liên từ.');
  S('s9c', 9, 2, 'Câu hỏi gián tiếp',
    'Scientists still do not know exactly _____.',
    ['why do whales sing', 'why whales sing', 'whales sing why', 'why sing whales'], 'B',
    'Mệnh đề danh từ (câu hỏi gián tiếp) giữ trật tự câu khẳng định: "why whales sing", không đảo trợ động từ.');
  S('s9d', 9, 3, 'That làm chủ ngữ',
    '_____ the Earth revolves around the Sun was once a controversial idea.',
    ['That', 'What', 'Because', 'It'], 'A',
    'Cả mệnh đề "the Earth revolves around the Sun" làm chủ ngữ của "was", nên cần "That". Mệnh đề đã đủ thành phần nên không dùng "What".');
  W('s9e', 9, 2, 'Phân từ bị động đầu câu',
    '[Writing] in 1852, Uncle Tom\'s Cabin [became] one of the [most widely] read [novels] of its time.', 'A',
    'Cuốn sách "được viết" (bị động), nên dùng "Written in 1852".');
  W('s9f', 9, 1, '-ed / -ing',
    'The audience was [boring] by the [long] speech [and] began [to leave].', 'A',
    'Khán giả cảm thấy chán nên dùng "bored". "Boring" mô tả thứ gây ra sự nhàm chán.');
  W('s9g', 9, 3, 'Having + V3',
    '[Having] [finishing] the experiment, the researchers [recorded] [their] results.', 'B',
    'Phân từ hoàn thành có dạng "Having + V3": "Having finished".');
  S('s9h', 9, 2, 'Mệnh đề danh từ với how',
    'The museum guide explained _____ the ancient pottery had been made.',
    ['how', 'what', 'that how', 'which'], 'A',
    'Cần từ nối mệnh đề danh từ chỉ cách thức: "how". Mệnh đề phía sau đã đủ thành phần nên "what" và "which" không hợp; "that how" thừa từ.');

  const stations = [
    { type: 'info', title: 'Làm quen đề ITP', sub: '3 phần thi · 115 phút' },
    { type: 'lesson', title: 'Chủ ngữ & động từ', sub: 'Mệnh đề, liên từ', tips: [
      'Mỗi mệnh đề cần ít nhất một chủ ngữ và một động từ chia thì. V-ing và to V không phải động từ chính.',
      'Hai mệnh đề cần đúng một liên từ nối. Không dùng "although ... but" hay "because ... so".',
      '"Because, although, since" + mệnh đề. "Because of, despite, due to" + danh từ.' ] },
    { type: 'lesson', title: 'Mệnh đề quan hệ', sub: 'Who, which, whose, rút gọn', tips: [
      '"Who" cho người, "which" cho vật, "whose + danh từ" chỉ sở hữu.',
      'Có dấu phẩy thì không dùng "that".',
      'Rút gọn: V-ing nếu chủ động, V3 nếu bị động. Đồng vị ngữ là một cụm danh từ đặt giữa hai dấu phẩy.' ] },
    { type: 'lesson', title: 'Hoà hợp chủ – vị', sub: 'Số ít, số nhiều, thì', tips: [
      'Tìm chủ ngữ thật, bỏ qua các cụm "of ..." hay mệnh đề chen giữa.',
      '"Each, every, the number of" đi với động từ số ít. "A number of" đi với số nhiều.',
      'Có mốc thời gian quá khứ (in 1849) thì động từ chính chia quá khứ.' ] },
    { type: 'lesson', title: 'Dạng từ', sub: 'Danh, động, tính, trạng từ', tips: [
      'Sau "the, a, of, tính từ sở hữu" thường là danh từ.',
      'Trước danh từ là tính từ. Bổ nghĩa cho động từ hoặc tính từ là trạng từ (-ly).',
      'Đọc lướt từng phần gạch chân và tự hỏi: vị trí này cần loại từ gì?' ] },
    { type: 'lesson', title: 'Danh từ & đại từ', sub: 'Many/much, mạo từ, số nhiều', tips: [
      '"Many, few" đi với danh từ đếm được số nhiều. "Much, little" đi với danh từ không đếm được.',
      'Sau số lớn hơn 1, danh từ đếm được phải ở số nhiều.',
      'Đại từ và tính từ sở hữu (its, their) phải khớp số với danh từ mà nó thay thế.' ] },
    { type: 'lesson', title: 'Song song & so sánh', sub: 'And/or, -er, the more', tips: [
      'Các thành phần nối bằng "and, or" phải cùng dạng: cùng danh từ, cùng V-ing, cùng to V...',
      'Không dùng "more" cùng "-er". "As ... as" không đi với "than".',
      'So sánh kép: "The + so sánh hơn ..., the + so sánh hơn ...".' ] },
    { type: 'lesson', title: 'Đảo ngữ & lỗi thừa', sub: 'Only, rarely, hardly, so', tips: [
      '"Only after, not until, rarely, seldom, hardly, so + adj" đứng đầu câu thì đảo trợ động từ lên trước chủ ngữ.',
      'Các cặp cố định: "hardly ... when", "no sooner ... than".',
      'Tránh từ thừa nghĩa như "return back", "repeat again".' ] },
    { type: 'lesson', title: 'Động từ', sub: 'Bị động, V-ing hay to V', tips: [
      'Bị động luôn là "be + V3". Chủ ngữ không tự làm hành động thì nghĩ ngay đến bị động.',
      'Sau "enjoy, avoid, finish" và sau giới từ dùng V-ing. Sau "decide, plan, want" dùng to V.',
      '"Make, let, have + người" đi với động từ nguyên mẫu không "to".' ] },
    { type: 'lesson', title: 'Phân từ & mệnh đề danh từ', sub: 'V-ing, V3, that, how, why', tips: [
      'Cụm phân từ đầu câu bổ nghĩa cho chủ ngữ ngay sau dấu phẩy: chủ động dùng V-ing, bị động dùng V3.',
      '"-ed" cho cảm xúc của người (bored), "-ing" cho thứ gây ra cảm xúc (boring).',
      'Câu hỏi gián tiếp giữ trật tự câu khẳng định: "know why whales sing", không đảo ngữ.' ] },
    { type: 'test', title: 'Mini test Section 2', sub: '20 câu · 12 phút', structure: 8, written: 12, minutes: 12 },
    { type: 'test', title: 'Full test Section 2', sub: '40 câu · 25 phút, như đề thật', structure: 15, written: 25, minutes: 25 },
  ];

  window.BROWNY_BANK = { version: '2026-11-19-draft', questions, stations };
})();
