// ============================================================
// DATA.JS - Kho dữ liệu cho Đại Chiến Bàn Nhậu
// ============================================================

const DATA = {

  // ─────────────────────────────────────────────────────────
  // TRÒ 1: Vòng Quay Nhân Phẩm - Thử thách / Hình phạt (≥35)
  // ─────────────────────────────────────────────────────────
  spins: [
    {
      title: "Lệch pha",
      desc: "Người ngồi bên trái và bên phải bạn mỗi người uống 1 ly. Riêng bạn được miễn... nhưng phải ngồi vỗ tay khen họ 'uống giỏi quá!' với giọng thật hào hứng."
    },
    {
      title: "Đặc quyền Chủ tịch",
      desc: "Từ giờ đến hết 2 lượt sau, ai muốn đi vệ sinh đều phải giơ tay xin phép bạn. Ai quên xin hoặc bị từ chối mà vẫn đi thì phạt ngay 1 ly khi về."
    },
    {
      title: "Phản cung",
      desc: "Chọn 1 người trong mâm để 'uống thay'. Nếu họ đồng ý, hai người cụng ly cùng uống. Nếu họ từ chối, BẠN phải uống 2 ly!"
    },
    {
      title: "Bộ trưởng Ngoại giao",
      desc: "Bạn được quyền ra 1 lệnh cho bất kỳ ai trong mâm (trong giới hạn vui vẻ nhé). Người đó phải thực hiện ngay, nếu không uống 1 ly."
    },
    {
      title: "Kẻ cô đơn",
      desc: "Uống 1 ly một mình đi, nhưng phải nhìn vào mắt từng người trên bàn trong khi uống, không được nhớp nháy. Ai cười trước phải cùng uống!"
    },
    {
      title: "Combo gia đình",
      desc: "Bạn chọn 2 người bất kỳ làm 'bố mẹ nuôi' của mâm hôm nay. Cả 3 người cụng ly uống cùng nhau và tặng nhau 1 câu ngọt ngào."
    },
    {
      title: "Thám tử nhậu",
      desc: "Đặt 1 câu hỏi Yes/No cho cả bàn (ví dụ: 'Ai chưa rửa chén tuần này?'). Ai trả lời Có phải uống, ai trả lời Không mà bị bắt bài thì uống 2 ly."
    },
    {
      title: "Hiệp sĩ bảo vệ",
      desc: "Chọn 1 người để 'bảo vệ' suốt lượt tiếp theo. Nếu người đó bị phạt uống, BẠN uống thay. Liệu hồn chọn đúng người nha!"
    },
    {
      title: "Vũ điệu xấu hổ",
      desc: "Đứng lên nhảy 1 động tác tự chế trong 10 giây. Cả mâm chấm điểm. Nếu điểm trung bình dưới 5, uống thêm 1 ly vì 'múa xấu'."
    },
    {
      title: "Hội đồng thương lượng",
      desc: "Bạn được phép đề xuất 1 luật chơi mới cho cả mâm trong 3 lượt tới. Mâm bầu, nếu quá bán đồng ý thì có hiệu lực ngay."
    },
    {
      title: "Cầu Thủ dự bị",
      desc: "Uống 1 ly, nhưng được quyền 'dự bị' người tiếp theo bị quay trúng. Người đó trúng thưởng thì bạn chia sẻ hình phạt cùng họ."
    },
    {
      title: "Màn hình chia sẻ",
      desc: "Mở điện thoại và cho cả mâm xem ảnh cuối cùng trong Camera Roll. Giải thích bức ảnh đó trong 20 giây. Không giải thích được thì uống 2 ly."
    },
    {
      title: "Phép thuật đảo ngược",
      desc: "Người ngồi đối diện với bạn chọn ai uống thay bạn. Nếu không có ai tình nguyện trong 5 giây, bạn vẫn phải tự uống và uống thêm 1 ly phụ."
    },
    {
      title: "Triết gia nhậu",
      desc: "Nói 1 câu triết lý cuộc sống liên quan đến... bia rượu. Phải thật sâu sắc hoặc thật buồn cười. Mâm chấm điểm, dưới 6 điểm thì uống."
    },
    {
      title: "Màn thú tội mini",
      desc: "Khai 1 điều 'bí mật' nhỏ mà bạn chưa nói với ai trong mâm này (không cần to tát, chỉ cần thật). Không dám khai thì uống 2 ly."
    },
    {
      title: "Quyền miễn tử",
      desc: "Bạn được 1 thẻ miễn tử! Nhét vào túi, dùng được 1 lần duy nhất trong suốt buổi để bỏ qua 1 hình phạt bất kỳ. Bảo toàn kỹ nha!"
    },
    {
      title: "Hội đồng xét xử",
      desc: "Cả mâm bình chọn 1 người 'có tội' hôm nay (tội gì cũng được, miễn vui). Người đó uống 2 ly để chuộc tội."
    },
    {
      title: "Dây chuyền định mệnh",
      desc: "Uống 1 ly, rồi chọn người tiếp theo phải uống. Người đó lại chọn tiếp người khác. Cứ thế cho đến khi có người từ chối (và uống 2 ly)."
    },
    {
      title: "Màn ảo thuật",
      desc: "Trình diễn 1 trò ảo thuật nhỏ bằng bất cứ thứ gì trên bàn. Nếu không lừa được ai thì uống 1 ly. Nếu lừa được thì người bị lừa uống!"
    },
    {
      title: "Combo Tâm sự",
      desc: "Chọn 1 người trong mâm và khen họ bằng 3 điều thật lòng (không được giả tạo). Người được khen uống 1 ly vì 'quá tuyệt vời'."
    },
    {
      title: "Nội quy Nhà hàng",
      desc: "Từ lượt này, ai trong mâm nói từ 'uống' hoặc 'ly' thì phải uống ngay. Hiệu lực trong 10 phút hoặc hết 2 vòng quay."
    },
    {
      title: "Người phát ngôn",
      desc: "Trả lời câu hỏi này to và rõ: 'Ai trong mâm hôm nay khiến bạn bất ngờ nhất và tại sao?' Trả lời quá 20 giây thì phạt thêm 1 ly."
    },
    {
      title: "Trận tỷ thí",
      desc: "Chọn 1 đối thủ, thi đấu bất kỳ môn gì cả mâm đề xuất (oẳn tù tì, tung xu, đánh giải toán…). Kẻ thua uống 2 ly!"
    },
    {
      title: "Điệp vụ bí mật",
      desc: "Chọn 1 người trong mâm và giao cho họ 1 nhiệm vụ bí mật (thì thầm vào tai). Nhiệm vụ phải hoàn thành trước khi kết thúc lượt tới. Thất bại thì cả hai cùng uống."
    },
    {
      title: "Quán quân Karaoke",
      desc: "Hát to 1 đoạn bài hát nào đó (tối thiểu 10 giây). Mâm chấm sao từ 1-5. Trung bình dưới 3 sao thì uống 2 ly tự trừng phạt."
    },
    {
      title: "Ngoại lệ đặc biệt",
      desc: "Lần này bạn KHÔNG phải uống, nhưng phải đứng lên cúi đầu cảm ơn cả mâm vì 'sự khoan hồng vô biên' của họ trong 10 giây."
    },
    {
      title: "Cứu trợ khẩn cấp",
      desc: "Bạn được phép chọn 1 người uống thay toàn bộ hình phạt của bạn trong lượt này. Điều kiện: Phải nói được 1 lý do thuyết phục trong 10 giây."
    },
    {
      title: "Vũ khí bí mật",
      desc: "Bạn có quyền áp dụng thêm 1 hình phạt tùy ý cho người bị trúng lượt TIẾP THEO sau bạn. Mưu đồ ngay đi!"
    },
    {
      title: "Bộ nhớ thần thánh",
      desc: "Kể tên toàn bộ 16 người trong mâm hôm nay theo thứ tự ngồi. Sai tên ai thì người đó chọn hình phạt cho bạn!"
    },
    {
      title: "Combo nụ cười",
      desc: "Nhìn vào mắt người ngồi đối diện và cười toe toét trong 15 giây không được ngưng. Ai phá trước (người cười hoặc đối diện) thì uống."
    },
    {
      title: "Màn hình bán hàng",
      desc: "Chào hàng và thuyết phục cả mâm mua 1 món đồ ngẫu nhiên trên bàn trong 30 giây. Thuyết phục được ít nhất 3 người thì thoát phạt!"
    },
    {
      title: "Thiên tài bất đắc dĩ",
      desc: "Trả lời ngay không được nghĩ: Tên thủ đô của 5 nước châu Âu bất kỳ. Sai hoặc không đủ thì uống 1 ly mỗi câu thiếu."
    },
    {
      title: "Màn thực tế ảo",
      desc: "Miêu tả cảm xúc của bạn lúc này bằng... cử chỉ tay và nét mặt, không được nói. Ai đoán sai cả mâm thì người đó uống."
    },
    {
      title: "Hội đồng bình chọn",
      desc: "Cả mâm bình chọn: Bạn phải uống 1 ly hay 2 ly? Kết quả nào nhiều phiếu hơn thì thực hiện theo đó. Dân chủ mà!"
    },
    {
      title: "Biên niên sử nhậu",
      desc: "Kể 1 kỷ niệm nhậu hài hước nhất của bạn trong quá khứ trong 30 giây. Cả mâm thích thì bạn thoát. Mâm không thích thì uống vì 'kể nhàm'."
    },
    {
      title: "Phong bì bí ẩn",
      desc: "Bạn được chọn: Uống ngay 1 ly, hoặc thực hiện 1 thử thách BÍ ẨN do mâm đề xuất (không được biết trước). Dũng cảm chọn thử thách không?"
    }
  ],

  // ─────────────────────────────────────────────────────────
  // TRÒ 2: Ai Là Người... (≥30 câu)
  // ─────────────────────────────────────────────────────────
  whoIs: [
    "Ai là người hay nhắn 'đang ra rồi' khi mới bắt đầu đi tắm?",
    "Ai là người dễ say nhất mâm nhưng lúc nào cũng gáy 'tôi vẫn tỉnh lắm'?",
    "Ai là người hay 'ủ mưu' đặt bàn ăn rồi biến mất khi tính tiền?",
    "Ai là người selfie nhiều nhất mỗi khi ra ngoài ăn uống?",
    "Ai là người hay order món ăn rồi không ăn được hết?",
    "Ai là người ngủ sớm nhất mỗi khi cả nhóm hẹn chơi khuya?",
    "Ai là người hay 'tự dưng vắng mặt' mà không báo trước?",
    "Ai là người order đồ uống đắt nhất nhưng uống ít nhất?",
    "Ai là người hay hô 'mình uống nước suối thôi' nhưng cuối cùng lại uống nhiều nhất?",
    "Ai là người khi say thì 'thương yêu' tất cả mọi người và hay ôm hôn loạn?",
    "Ai là người luôn claim 'ăn ít thôi' nhưng lại múc tô lớn nhất?",
    "Ai là người hay 'mở app' game hoặc mạng xã hội trong khi cả nhóm đang chuyện trò?",
    "Ai là người hay đến trễ nhất nhưng lý do luôn nghe... có vẻ hợp lý?",
    "Ai là người dễ bị kéo đi nhậu nhất, dù ban đầu từ chối rất kiên quyết?",
    "Ai là người kể chuyện hay nhất nhưng... hơi phóng đại một tí?",
    "Ai là người 'bắt bệnh lây': Chỉ cần 1 người ngáp là họ ngáp theo ngay?",
    "Ai là người hay vào toilet lâu nhất mỗi khi cả nhóm đi chơi?",
    "Ai là người dùng điện thoại nhiều nhất nhưng lại bảo 'tao không nghiện phone đâu'?",
    "Ai là người hay ra lệnh 'nào cả nhóm chụp ảnh' nhưng lại trốn góc khuất?",
    "Ai là người ngủ gục sớm nhất nếu buổi nhậu kéo dài đến 10 giờ tối?",
    "Ai là người hay 'bình loạn' về thức ăn nhiều nhất dù không biết nấu?",
    "Ai là người gọi điện cho người thân nhiều nhất khi say?",
    "Ai là người hay 'thất lạc' trong nhóm mỗi khi đi chơi đông người?",
    "Ai là người dễ bị thuyết phục nhất khi ai đó nói 'uống thêm 1 ly thôi'?",
    "Ai là người luôn hỏi 'chụp ảnh rồi đăng lên mạng được không' trước khi ăn?",
    "Ai là người 'trốn' không dám hát karaoke nhưng lại thuộc lời bài hát nhiều nhất?",
    "Ai là người hay 'bonus' thêm phần ăn khi tính bill mà không ai biết?",
    "Ai là người hay 'mượn' điện thoại người khác mà không trả đúng hẹn?",
    "Ai là người hay hô to nhất 'một hai ba dzô' nhưng uống ít nhất?",
    "Ai là người mà nếu vắng mặt thì mâm... vui hơn hay buồn hơn? (Trả lời thật nhé!)",
    "Ai là người có biểu cảm mặt hài hước nhất khi uống đồ đắng hoặc cay?",
    "Ai là người hay đặt ra luật chơi nhưng lại vi phạm chính luật đó trước tiên?",
    "Ai là người chuyên gia chốt kèo 'tháng sau đi Đà Lạt/Phú Quốc nhé' trên bàn nhậu nhưng sáng hôm sau quên sạch?",
    "Ai là người có 'nhân phẩm' xui xẻo nhất, cứ chơi trò may rủi trên bàn nhậu là chắc chắn dính phạt?",
    "Ai là người dễ 'chốt đơn' Shopee hoặc TikTok Shop lúc nửa đêm nhất, đặc biệt là khi đang có hơi men?",
    "Ai là người hay biến mất kiểu 'ninja', lẳng lặng đi về trước mà không thèm chào ai một câu?",
    "Ai là người kén ăn nhất mâm, ngồi gắp từng cọng hành, rau mùi ra khỏi bát mất cả thanh xuân?",
    "Ai là người hễ say vào là chỉ kể đi kể lại đúng một câu chuyện cũ rích từ năm này qua năm khác?",
    "Ai là người hát lệch tông nhất nhóm nhưng lúc nào cũng cực kỳ tự tin và nhập tâm?",
    "Ai là người luôn mang theo cả thế giới trong túi xách/balo (khăn giấy, sạc dự phòng, kẹo cao su, thuốc giải rượu...)?",
    "Ai là người có điệu cười 'bá đạo' và to nhất, cười một phát là cả quán quay sang nhìn?",
    "Ai là người dễ 'cảm nắng' người lạ nhất, từ nhân viên phục vụ cho đến bàn bên cạnh?",
    "Ai là người tối nay mạnh miệng hứa 'mai 6 giờ sáng dậy chạy bộ' nhưng thực tế ngủ thẳng cẳng tới trưa?",
    "Ai là người chuyên làm 'bác sĩ tâm lý', hay bị cả nhóm lôi ra tâm sự chuyện đời, chuyện tình cảm nhất?",
    "Ai là người hay lén đổ bớt bia hoặc đẩy ly sang cho người bên cạnh khi không ai để ý?",
    "Ai là người hay 'sĩ diện' xung phong uống hộ người khác nhất dù tửu lượng của mình cũng chẳng khá hơn?",
    "Ai là người có khả năng trở thành 'đại gia' giàu nhất mâm này trong 5 năm tới?",
    "Ai là người hay 'đào mộ' những chuyện quê độ ngày xưa của bạn bè ra kể nhất?",
    "Ai là người miệng lúc nào cũng kêu 'đang giảm cân' nhưng tay vẫn gọi thêm trà sữa và đồ chiên?"
  ],

  // ─────────────────────────────────────────────────────────
  // TRÒ 3: Thật hay Thách
  // ─────────────────────────────────────────────────────────
  truth: {
    mild: [
      "Bạn đã bao giờ giả vờ thích một món quà mà thực ra bạn ghét cay ghét đắng chưa?",
      "Thứ kinh khủng nhất bạn từng phải nuốt trôi chỉ vì phép lịch sự là gì?",
      "Bạn đã bao giờ giả ốm để trốn kèo đi chơi chưa?",
      "Bài hát nào bạn cực thích nhưng không bao giờ dám mở trước mặt người khác?",
      "Bạn đã bao giờ hùa theo chém gió là đã xem một bộ phim hay đọc một cuốn sách chỉ để hoà nhập chưa?",
      "Bạn đã bao giờ cười hùa theo một câu nói đùa mà bạn chẳng hiểu gì chưa?",
      "Một lời khen bạn từng nói ra nhưng không hề thật lòng?",
      "Bạn đã bao giờ khóc khi xem một bộ phim mà bạn từng chê là nhạt nhẽo với mọi người chưa?",
      "Thời gian lâu nhất bạn không tắm là bao lâu?",
      "Bạn đã bao giờ giả vờ hiểu người ta đang nói gì trong khi chả biết cái quái gì chưa?",
      "Trend nào bạn bí mật 'đu' theo nhưng bề ngoài lại chê bai?",
      "Bạn đã bao giờ đem quà người khác tặng mình đi tặng lại cho người khác chưa?",
      "Trò đáng xấu hổ nhất bạn từng làm chỉ để gây sự chú ý với ai đó?",
      "Bạn đã bao giờ khai gian tuổi của mình chưa?",
      "Pha nhắn tin lỗi tự sửa (autocorrect) xấu hổ nhất bạn từng gửi là gì?",
      "Món ăn nào ai cũng khen ngon nhưng bạn thấy dở tệ?",
      "Bạn đã bao giờ lén ăn vụng đồ của bạn cùng phòng hoặc người nhà rồi chối bay biến chưa?",
      "Ấn tượng đầu tiên của bạn về người ngồi bên phải bạn là gì?",
      "Bạn đã bao giờ giả vờ nghe điện thoại để né phải chào người quen ngoài đường chưa?",
      "Thói quen kỳ lạ nhất của bạn khi ở một mình là gì?",
      "Bạn đã bao giờ ngủ quên trong rạp chiếu phim hoặc trên lớp học chưa?",
      "Kỷ niệm quê độ nhất của bạn khi đi ăn ở quán hoặc nhà hàng là gì?",
      "Bạn đã bao giờ nói xấu ai đó mà quên mất họ đang đứng ngay sau lưng chưa?",
      "Bộ phim hoạt hình hoặc truyện tranh nào lớn rồi bạn vẫn lén xem?",
      "Bạn đã bao giờ mở tin nhắn đọc trên thông báo nhưng cố tình không vào app để khỏi hiện 'Đã xem' chưa?",
      "Món đồ đắt tiền nhất bạn từng mua về nhưng chỉ dùng đúng một lần rồi bỏ xó là gì?",
      "Nếu phải đổi cuộc sống với một người trong mâm này trong 1 tuần, bạn sẽ chọn ai?"
    ],
    spicy: [
      "Bức ảnh nào đáng xấu hổ nhất trong thư viện ảnh của bạn lúc này?",
      "Bạn đã bao giờ nói dối trên profile ứng dụng hẹn hò chưa?",
      "Thứ kỳ quái nhất bạn đã tìm kiếm trên Google tuần này là gì?",
      "Bạn đã bao giờ nhắn nhầm thứ không nên nhắn cho một người chưa?",
      "Một bí mật bạn giấu bố mẹ mà đến giờ họ vẫn chưa biết?",
      "Bạn đã bao giờ lén xem trộm điện thoại của ai đó chưa?",
      "Món đồ tồi tệ nhất bạn từng chốt đơn khi đang say hoặc ngà ngà là gì?",
      "Bạn đã bao giờ stalk người yêu cũ trên mạng xã hội chưa?",
      "Một lời nói dối bạn từng thốt ra mà đến giờ vẫn cảm thấy tội lỗi?",
      "Tin nhắn sến súa/cringe nhất bạn từng gửi cho crush là gì?",
      "Bạn đã bao giờ 'mượn tạm' đồ của ai đó và không bao giờ trả lại chưa?",
      "Điều ngu ngốc nhất bạn từng làm vì crush là gì?",
      "Bạn đã bao giờ ghost một người mà bạn thực sự có tình cảm chưa?",
      "Bạn đã bao giờ huỷ theo dõi hoặc block ai đó trong căn phòng này chưa?",
      "Bức ảnh dìm hàng nhất của bạn đang tồn tại trên mạng là bức nào?",
      "Nếu buộc phải chọn một người trong mâm này để đi hẹn hò thử, bạn sẽ chọn ai?",
      "Bạn đã bao giờ có cảm tình với người yêu hoặc crush của bạn thân chưa?",
      "Lần gần nhất bạn khóc là khi nào và vì lý do gì?",
      "Bạn đã bao giờ dùng tài khoản ảo (clone) để đi stalk hoặc bình luận dạo chưa?",
      "Điểm yếu hoặc tật xấu lớn nhất của bạn trong một mối quan hệ yêu đương là gì?",
      "Trong mâm này, ai là người bạn thấy khó đoán hoặc khó hiểu nhất?",
      "Bạn đã bao giờ hối hận vì đã bỏ lỡ một người nào đó chưa? Kể tên chữ cái đầu của họ.",
      "Kỷ niệm say xỉn mất kiểm soát nhất trong đời bạn là gì?",
      "Bạn đã bao giờ nói dối người yêu để đi chơi hoặc đi nhậu với bạn bè chưa?",
      "Tiêu chuẩn 'red flag' nào ở người khác khiến bạn muốn chạy mất dép ngay lập tức?",
      "Nếu ngay bây giờ người yêu cũ nhắn tin 'Mình quay lại nhé', bạn sẽ trả lời sao?",
      "Bạn đã bao giờ bị từ chối phũ phàng nhất theo cách nào?"
    ]
  },

  dare: {
    mild: [
      "Nhắn tin 'anh/chị yêu em' cho người đầu tiên trong danh bạ điện thoại của bạn (không được giải thích gì thêm, gửi rồi đặt điện thoại xuống).",
      "Đứng lên và làm 1 động tác múa phụ họa cho bài hát đang phát (hoặc bài hát bạn tự hát). Phải đủ 15 giây.",
      "Nhờ người ngồi kế bên đặt tên cho bạn bằng 1 biệt danh mới và bạn phải dùng tên đó suốt buổi hôm nay.",
      "Chụp ảnh tự sướng với biểu cảm xấu hổ nhất có thể và đăng lên story trong 10 phút.",
      "Nói 'tôi rất tự hào về bản thân' to và dõng dạc 3 lần liên tiếp không được cười.",
      "Bắt chước giọng nói và điệu bộ của 1 người trong mâm trong 30 giây. Cả mâm đoán bạn đang giả ai.",
      "Mượn điện thoại người ngồi cạnh và đặt ảnh đại diện Zalo/Facebook của họ thành ảnh... của bạn trong 5 phút.",
      "Nhắn tin cho người bạn thân nhất ngoài mâm này: 'Tao đang nhậu với mấy người bạn thần thánh của tao đây!'",
      "Gọi to tên 1 người trong mâm và tặng họ 1 lời khen siêu sến (phải mịn, không được cứng).",
      "Làm mặt xấu nhất có thể trong 10 giây, cả mâm chụp ảnh lại làm kỷ niệm.",
      "Thực hiện 10 cái nhảy cóc hoặc 15 cái hít đất (chọn 1) để 'giải rượu' cho bản thân.",
      "Uống một ngụm bia/nước mà không được dùng tay chạm vào ly.",
      "Kể một câu chuyện cười trong 30 giây. Nếu không ai trong mâm cười thì bạn phải uống.",
      "Đọc to tin nhắn gần nhất bạn nhận được (không tính tin nhắn tổng đài/ngân hàng).",
      "Để người ngồi bên trái vẽ một hình bất kỳ lên mu bàn tay bạn bằng bút (hoặc tương ớt/nước chấm).",
      "Nói chuyện bằng giọng địa phương khác (Bắc/Trung/Nam) trong suốt 2 vòng chơi tiếp theo.",
      "Gắp một miếng đồ ăn và đút cho người ngồi đối diện theo phong cách thật lãng mạn.",
      "Giữ nguyên tư thế 'tượng sáp' không nhúc nhích, không chớp mắt lâu nhất có thể trong 20 giây, cả bàn được quyền chọc cười.",
      "Đứng dậy đi catwalk 1 vòng quanh bàn như người mẫu chuyên nghiệp.",
      "Vừa vỗ đầu vừa xoa bụng theo vòng tròn cùng lúc trong 15 giây; làm rối nhịp là uống.",
      "Quay video 5 giây nói 'Hôm nay tôi bao cả bàn' (chỉ quay làm bằng chứng vui, không cần đăng).",
      "Hát bài 'Chúc mừng sinh nhật' theo phong cách nhạc buồn/sâu lắng.",
      "Bịt mắt lại, để một người bất kỳ trong mâm chạm vào tay bạn và đoán xem đó là ai."
    ],
    spicy: [
      "Chọn 1 người ngồi khác phía bàn, nhìn thẳng vào mắt họ và nói 1 câu thả thính sến nhất có thể trong 10 giây. Ai cười trước uống 100%!",
      "Gọi điện cho 1 người quan trọng trong đời bạn và nói 'em/anh chị muốn nói... anh chị/em là người quan trọng nhất với em/anh'. Không giải thích thêm rồi cúp máy.",
      "Nhắn tin cho người crush hiện tại (hoặc ex gần nhất) chỉ 1 từ: 'Nhớ.' Rồi đặt điện thoại xuống và không được nhìn điện thoại 10 phút.",
      "Chọn 2 người trong mâm đóng vai... cặp đôi vừa cãi nhau 30 giây rồi làm hòa trong 10 giây. Ai diễn tệ nhất uống thêm 1 ly.",
      "Đứng lên, cầm ly và phát biểu cảm xúc thật của bạn về 1 người cụ thể trong mâm (phải thật, không được giả). Người được đề cập tặng 1 ly cảm ơn.",
      "Trao đổi điện thoại với người ngồi đối diện trong 3 phút. Không được lock màn hình. Chỉ được nhìn, không được xóa gì.",
      "Chọn 1 người trong mâm để cùng thực hiện thử thách: Hai người nhìn nhau và đếm 1-2-3 cùng lúc, không được lệch nhau. Nếu lệch thì cả hai uống và thử lại tới khi đếm đúng.",
      "Hát 1 câu trong bài hát bạn đang nghĩ đến ngay lúc này. Phải hát thật to không được ấp úng. Mâm chấm điểm, 5 điểm trở xuống thì uống thêm 1 ly.",
      "Nhắn tin vào group chat gia đình (hoặc group bạn bè khác) dòng chữ: 'Mọi người ơi em đang rất vui và muốn chia sẻ điều đó!' (Không giải thích thêm, gửi rồi thôi).",
      "Thách người ngồi bên trái bạn thi uống: Ai uống xong ly trước thì được quyền ra 1 lệnh cho người kia.",
      "Chọn 1 người trong mâm và 'tặng' họ 1 biệt danh siêu hài hước phù hợp với tính cách. Cả mâm biểu quyết có hay không. Nếu đa số đồng ý thì biệt danh đó có hiệu lực tới cuối buổi.",
      "Chạy quanh bàn nhậu 1 vòng (hoặc đi bộ nhanh nếu không có không gian) và hô to: 'Hôm nay tao là người vui nhất!' Không được cười trong khi hô.",
      "Mở lịch sử tìm kiếm gần nhất trên TikTok hoặc Facebook và đọc to 3 từ khóa đầu tiên.",
      "Cho người ngồi bên phải xem bức ảnh thứ 5 tính từ trên xuống trong thư viện ảnh của bạn.",
      "Nhắn tin cho một người khác giới bất kỳ trong danh sách chat gần đây: 'Ê, dạo này thấy bạn xinh/đẹp trai ra hẳn luôn á'.",
      "Để cả bàn chọn một người trong danh bạ của bạn, bạn phải gọi điện hỏi vay họ 500 nghìn với giọng thật nghiêm túc.",
      "Kể tên 3 điểm tốt và 1 điểm xấu của người ngồi đối diện bạn ngay lúc này.",
      "Đăng một dòng trạng thái (Note Messenger hoặc Story) đúng 3 chữ: 'Hết yêu rồi...' trong vòng 15 phút.",
      "Nhìn thẳng vào mắt người ngồi bên trái và nói 'Thật ra tao thích mày lâu rồi' với vẻ mặt nghiêm túc nhất có thể.",
      "Uống cạn ly của mình theo kiểu giao bôi (khoác tay) với người mà bạn chọn trên bàn.",
      "Mở mục 'Đã chặn' (Blocked) trên Facebook hoặc Messenger và giải thích lý do chặn người đầu tiên trong danh sách.",
      "Để người thắng ở lượt trước chọn một bài nhạc bất kỳ, bạn phải hát nhép (lip-sync) cực kỳ nhập tâm trong 20 giây.",
      "Gọi điện cho một người bạn không có mặt ở đây và cố gắng thuyết phục họ ra quán nhậu ngay lập tức trong vòng 1 phút.",
      "Cho người ngồi đối diện quyền soạn 1 tin nhắn bất kỳ (không thô tục) gửi vào group chat chung của lớp/công ty/nhóm bạn."
    ]
  },

  // ─────────────────────────────────────────────────────────
  // TRÒ 5: Quả Bom Hẹn Giờ - Chủ đề (≥25)
  // ─────────────────────────────────────────────────────────
  bombTopics: [
    "🍺 Kể tên các loại bia Việt Nam mà bạn biết",
    "🤣 Kể tên các lý do đi muộn kinh điển",
    "🍖 Kể tên các món nhậu không thể thiếu",
    "😅 Kể tên các câu xin lỗi kinh điển khi sai hẹn",
    "🎵 Kể tên các bài hát karaoke tủ của người Việt",
    "🤦 Kể tên các lý do kinh điển để từ chối đi nhậu",
    "🏖️ Kể tên các địa điểm du lịch nổi tiếng Việt Nam",
    "😂 Kể tên các câu cửa miệng của dân nhậu",
    "🍜 Kể tên các món ăn khuya kinh điển sau khi nhậu",
    "👗 Kể tên các thương hiệu thời trang mà bạn biết",
    "📱 Kể tên các ứng dụng bạn hay dùng nhất",
    "🚗 Kể tên các hãng xe ô tô mà bạn biết",
    "😎 Kể tên các từ lóng giới trẻ Việt Nam đang thịnh hành",
    "🎬 Kể tên các bộ phim Việt Nam mà bạn từng xem",
    "🌏 Kể tên các nước Đông Nam Á",
    "🦁 Kể tên các con vật trong vườn thú",
    "🎂 Kể tên các loại bánh ngọt",
    "⚽ Kể tên các cầu thủ bóng đá nổi tiếng",
    "🎮 Kể tên các tựa game di động phổ biến",
    "💼 Kể tên các nghề nghiệp 'nghe xịn' nhưng không biết làm gì",
    "🌶️ Kể tên các loại nước chấm trong ẩm thực Việt",
    "🎉 Kể tên các lý do để tổ chức tiệc nhậu",
    "🤔 Kể tên các câu hỏi không bao giờ có câu trả lời đúng",
    "🛵 Kể tên các đặc điểm giao thông ở Việt Nam",
    "😴 Kể tên các tư thế ngủ buồn cười",
    "🌟 Kể tên các siêu anh hùng mà bạn biết",
    "🎯 Kể tên các trò chơi dân gian Việt Nam",
    "🍵 Kể tên các loại trà sữa hoặc topping trà sữa",
    "💔 Kể tên các câu chia tay kinh điển ('Anh không xứng với em'...)",
    "🍜 Kể tên các món ăn sáng phổ biến ở Việt Nam",
    "🐶 Kể tên các giống chó hoặc mèo mà bạn biết",
    "🏖️ Kể tên các tỉnh/thành phố ở Việt Nam",
    "🎤 Kể tên các ca sĩ hoặc rapper Việt Nam",
    "🍎 Kể tên các loại trái cây miền nhiệt đới",
    "🚩 Kể tên các dấu hiệu 'red flag' khi yêu",
    "💸 Kể tên các lý do phổ biến khiến bạn hết tiền cuối tháng",
    "🏫 Kể tên các môn học ở trường cấp 3",
    "🛒 Kể tên các món đồ hay mua trên Shopee/TikTok Shop nhưng ít dùng",
    "👻 Kể tên những thứ khiến nhiều người sợ hãi (gián, độ cao, deadline...)",
    "☕ Kể tên các chuỗi cà phê nổi tiếng ở Việt Nam",
    "🎁 Kể tên những món quà hay tặng người yêu vào dịp lễ",
    "🎬 Kể tên các bộ phim hoạt hình tuổi thơ (Doraemon, Conan...)"
  ],

  // ─────────────────────────────────────────────────────────
  // TRÒ 4: Nối Từ Căng Não (Bộ từ khởi đầu & gợi ý từ nối)
  // ─────────────────────────────────────────────────────────
  wordChain: [
    { word: "Bia hơi", nextHint: "Hơi..." },
    { word: "Mồi nhắm", nextHint: "Nhắm..." },
    { word: "Cạn ly", nextHint: "Ly..." },
    { word: "Rượu cần", nextHint: "Cần..." },
    { word: "Đá lạnh", nextHint: "Lạnh..." },
    { word: "Quán cóc", nextHint: "Cóc..." },
    { word: "Lạc rang", nextHint: "Rang..." },
    { word: "Gà nướng", nextHint: "Nướng..." },
    { word: "Lẩu thái", nextHint: "Thái..." },
    { word: "Bò khô", nextHint: "Khô..." },
    { word: "Bạn thân", nextHint: "Thân..." },
    { word: "Người yêu", nextHint: "Yêu..." },
    { word: "Thất tình", nextHint: "Tình..." },
    { word: "Cuối tuần", nextHint: "Tuần..." },
    { word: "Điện thoại", nextHint: "Thoại..." },
    { word: "Máy tính", nextHint: "Tính..." },
    { word: "Xe máy", nextHint: "Máy..." },
    { word: "Trà sữa", nextHint: "Sữa..." },
    { word: "Cà phê", nextHint: "Phê..." },
    { word: "Bóng đá", nextHint: "Đá..." },
    { word: "Âm nhạc", nextHint: "Nhạc..." },
    { word: "Du lịch", nextHint: "Lịch..." },
    { word: "Đồng hồ", nextHint: "Hồ..." },
    { word: "Mặt trời", nextHint: "Trời..." },
    { word: "Chìa khóa", nextHint: "Khóa..." },
    { word: "Quán ăn", nextHint: "Ăn..." },
    { word: "Bàn tiệc", nextHint: "Tiệc..." },
    { word: "Mưa rơi", nextHint: "Rơi..." },
    { word: "Lời nói", nextHint: "Nói..." },
    { word: "Rủ rê", nextHint: "Rê..." },
    { word: "Trái cây", nextHint: "Cây..." },
    { word: "Niềm vui", nextHint: "Vui..." },
    { word: "Mùa đông", nextHint: "Đông..." },
    { word: "Lễ cưới", nextHint: "Cưới..." },
    { word: "Ngủ trưa", nextHint: "Trưa..." }
  ],

  // ─────────────────────────────────────────────────────────
  // Tên mẫu 16 người
  // ─────────────────────────────────────────────────────────
  sampleNames: [
    "Linh Tiến", "Linh Xuyến", "Hải Hoàn", "Huyền Huấn",
    "Uyên", "Thủy Khanh", "Lê Huấn", "Vanh đĩ",
    "Chi Chử", "Nghĩa Tài", "Nam Ké", "Việt Đô",
    "Kiên Bung", "Mận Moi", "Bảo Thiệu", "Quân Chung"
  ]
};

// Đảm bảo gắn vào window để truy cập toàn cục
if (typeof window !== 'undefined') {
  window.DATA = DATA;
}
