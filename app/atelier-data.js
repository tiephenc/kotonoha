/* KOTONOHA · contenus de l'atelier (sujets d'expression écrite et scénarios de conversation).
   Contenu original rédigé pour KOTONOHA. Notation des furigana : 漢字{かな}.
   Chaque réplique proposée porte un statut : ok (naturel), mid (possible mais perfectible), no (erreur),
   et une explication en français. Relu par l'agent kotonoha-linguiste (voir KOTONOHA_FONCTIONNALITES.md). */
window.KX_ATELIER = {
  sujets: [
    /* g : libellés affichés (〜g) ; m : chaînes de détection (formes polies, sonorisées, kanji) ; u : unité où le point est enseigné. */
    { id: 'n4-journee', lv: 'N4', t: 'Ma journée type', c: 'Décrivez une journée habituelle, du réveil au coucher.', g: ['てから', 'たり'], m: [['てから', 'でから'], ['たり', 'だり']], u: [2, null], len: [150, 250] },
    { id: 'n4-weekend', lv: 'N4', t: 'Mon dernier week-end', c: 'Racontez ce que vous avez fait le week-end dernier et ce que vous en avez pensé.', g: ['とき', 'たら'], m: [['とき', '時、', '時に', '時は'], ['たら', 'だら']], u: [null, 21], len: [150, 250] },
    { id: 'n4-ville', lv: 'N4', t: 'Ma ville', c: 'Présentez la ville où vous habitez : ce qu’on y trouve, ce que vous aimez ou non.', g: ['ている', 'ので'], m: [['ている', 'ています', 'でいる', 'でいます'], ['ので']], u: [2, null], len: [150, 250] },
    { id: 'n4-voyage', lv: 'N4', t: 'Un voyage', c: 'Racontez un voyage marquant ou un voyage que vous aimeriez faire.', g: ['たことがある', 'てみる'], m: [['たことがあ', 'だことがあ'], ['てみ', 'でみ']], u: [null, null], len: [150, 250] },
    { id: 'n3-japonais', lv: 'N3', t: 'Pourquoi le japonais ?', c: 'Expliquez pourquoi vous apprenez le japonais et ce que cela a changé pour vous.', g: ['をきっかけに', 'ようになる'], m: [['をきっかけに', 'がきっかけで'], ['ようにな']], u: [58, 11], len: [250, 400] },
    { id: 'n3-teletravail', lv: 'N3', t: 'Le télétravail', c: 'Présentez les avantages et les inconvénients du travail à distance.', g: ['一方（で）', 'によって'], m: [['一方'], ['によって', 'により']], u: [85, null], len: [250, 400] },
    { id: 'n3-conseil', lv: 'N3', t: 'Conseils à un ami', c: 'Un ami part vivre au Japon. Donnez-lui trois conseils et justifiez-les.', g: ['ほうがいい', 'べき'], m: [['ほうがいい', '方がいい', 'ほうが良い', '方が良い'], ['べき']], u: [8, 103], len: [250, 400] },
    { id: 'n3-habitude', lv: 'N3', t: 'Changer une habitude', c: 'Quelle habitude voulez-vous changer ? Pourquoi, et comment allez-vous vous y prendre ?', g: ['ようにする', 'がち'], m: [['ようにし'], ['がち']], u: [45, 72], len: [250, 400] },
    { id: 'n2-reseaux', lv: 'N2', t: 'Réseaux sociaux et liens', c: 'Les réseaux sociaux rapprochent-ils vraiment les gens ? Donnez votre avis argumenté.', g: ['とは限らない', 'に限らず'], m: [['とは限', 'とはかぎ'], ['に限らず', 'にかぎらず']], u: [null, 158], len: [400, 600] },
    { id: 'n2-ia', lv: 'N2', t: 'Apprendre avec l’IA', c: 'Peut-on apprendre une langue étrangère grâce à l’intelligence artificielle ? Discutez.', g: ['を通じて', 'ものの'], m: [['を通じ', 'を通し'], ['ものの']], u: [194, 137], len: [400, 600] },
    { id: 'n2-travail', lv: 'N2', t: 'La place du travail', c: 'Quelle place le travail doit-il occuper dans une vie ? Appuyez-vous sur un exemple.', g: ['わけではない', 'からこそ'], m: [['わけでは', 'わけじゃ'], ['からこそ']], u: [66, null], len: [400, 600] },
    { id: 'n2-actu', lv: 'N2', t: 'Une actualité commentée', c: 'Résumez une actualité lue récemment (en citant la source), puis donnez votre point de vue.', g: ['によると', 'とのことだ'], m: [['によると', 'によれば'], ['とのこと']], u: [78, 100], len: [400, 600] },
  ],
  scenarios: [
    {
      id: 'resto', lv: 'N4', cat: 'Vie quotidienne', reg: 'poli', t: 'Au restaurant',
      role: 'Vous entrez seul·e dans un petit restaurant de ramen et vous commandez.',
      expr: [['〜をお願{ねが}いします', 'je voudrais… (pour commander)'], ['お会計{かいけい}', 'l’addition'], ['〜で払{はら}えますか', 'puis-je payer par… ?']],
      turns: [
        { p: '店員{てんいん}', l: 'いらっしゃいませ。何名{なんめい}様{さま}ですか。', o: [
          ['一人{ひとり}です。', 'ok', 'Réponse simple et naturelle. Pour une personne, on dit 一人（ひとり）.'],
          ['一{いち}人{にん}です。', 'no', 'Pour compter une seule personne, on dit 一人（ひとり）, pas « いちにん ».'],
          ['一人{ひとり}をください。', 'no', '« ください » sert à demander un objet. Ici, on indique seulement le nombre de personnes.']] },
        { p: '店員{てんいん}', l: 'こちらへどうぞ。ご注文{ちゅうもん}はお決{き}まりですか。', o: [
          ['はい、ラーメンを一{ひと}つお願{ねが}いします。', 'ok', '« 〜を一つお願いします » : la formule standard pour commander.'],
          ['すみません、もう少{すこ}し待{ま}ってください。', 'ok', 'Poli et naturel quand on n’a pas encore choisi.'],
          ['はい、ラーメンが食{た}べたいですか。', 'no', '« 〜たいですか » demande ce que l’autre veut. Ici, c’est à vous de dire ce que vous voulez.']] },
        { p: '店員{てんいん}', l: 'お飲{の}み物{もの}はいかがですか。', o: [
          ['お水{みず}をお願{ねが}いします。', 'ok', 'Commande polie et claire.'],
          ['大丈夫{だいじょうぶ}です。', 'mid', 'Très courant pour refuser poliment, mais parfois ambigu. 「けっこうです」 est plus net.'],
          ['お飲{の}み物{もの}はいかがです。', 'no', 'Vous répétez la question du serveur au lieu d’y répondre.']] },
        { p: '店員{てんいん}', l: 'お会計{かいけい}は千二百円{せんにひゃくえん}です。', o: [
          ['カードで払{はら}えますか。', 'ok', 'Forme potentielle 払える : « est-ce que je peux payer par carte ? »'],
          ['じゃあ、これでお願{ねが}いします。', 'ok', 'Naturel en tendant l’argent ou la carte.'],
          ['カードで払{はら}いますか。', 'no', '« 払いますか » demande si l’autre va payer. Utilisez le potentiel : 払えますか.']] },
      ],
    },
    {
      id: 'notes', lv: 'N4', cat: 'Université', reg: 'familier', t: 'Les notes de cours',
      role: 'Vous avez manqué un cours. Un·e camarade vous en parle ; vous lui demandez ses notes.',
      expr: [['〜てもらえないかな', 'est-ce que tu pourrais… ? (demande amicale)'], ['助{たす}かる', 'ça m’aide beaucoup'], ['〜んだ', 'j’explique : c’est que…']],
      turns: [
        { p: '友達{ともだち}', l: 'あ、マリーさん。昨日{きのう}の授業{じゅぎょう}、来{こ}なかったね。', o: [
          ['うん、熱{ねつ}があって、休{やす}んだんだ。', 'ok', '« 〜んだ » donne l’explication ; registre amical cohérent.'],
          ['はい、私{わたし}は来{き}ませんでした。', 'mid', 'Correct, mais trop formel entre camarades, et sans explication.'],
          ['うん、来{こ}ないだった。', 'no', 'Le passé négatif de 来る est 来なかった ; « 〜ないだった » n’existe pas.']] },
        { p: '友達{ともだち}', l: 'そうなんだ。もう大丈夫{だいじょうぶ}？', o: [
          ['うん、もう元気{げんき}になったよ。ありがとう。', 'ok', '« 元気になる » : aller mieux. Le よ final adoucit.'],
          ['大丈夫{だいじょうぶ}だ。', 'mid', 'Compréhensible mais sec ; à l’oral, 「もう大丈夫だよ」 est plus naturel.'],
          ['うん、元気{げんき}くなった。', 'no', '元気 est un adjectif en な : 元気になった, pas 元気くなった.']] },
        { p: '友達{ともだち}', l: 'よかった。何{なに}か困{こま}ってることある？', o: [
          ['実{じつ}は、授業{じゅぎょう}のノートを見{み}せてもらえないかな。', 'ok', '« 〜てもらえないかな » : demande amicale et polie.'],
          ['ノート、貸{か}してくれる？', 'ok', 'Demande directe entre amis, tout à fait naturelle.'],
          ['ノートを見{み}せてあげて。', 'no', '« 見せてあげて » demande à l’autre de montrer ses notes à quelqu’un d’autre (〜てあげる : service rendu à un tiers). Pour un service qu’on vous rend : 〜てもらえる / 〜てくれる.']] },
        { p: '友達{ともだち}', l: 'いいよ。明日{あした}持{も}ってくるね。', o: [
          ['ありがとう、助{たす}かる！', 'ok', '« 助かる » : « ça m’aide beaucoup », très courant.'],
          ['ありがとう、持{も}ってきてくれて。', 'mid', 'Ce remerciement convient une fois les notes apportées ; elles ne le sont pas encore.'],
          ['どういたしまして。', 'no', '« どういたしまして » répond à un remerciement ; ici, c’est vous qui remerciez.']] },
      ],
    },
    {
      id: 'retard', lv: 'N3', cat: 'Travail', reg: 'poli', t: 'Prévenir d’un retard',
      role: 'Votre train est en retard. Vous appelez votre supérieure, Mme Yamada, avant une réunion.',
      expr: [['申{もう}し訳{わけ}ありません', 'je suis vraiment désolé·e (formel)'], ['間{ま}に合{あ}う', 'arriver à temps'], ['〜ておきました', 'j’ai fait… à l’avance']],
      turns: [
        { p: '上司{じょうし}', l: 'はい、山田{やまだ}です。', o: [
          ['おはようございます、マルタンです。申{もう}し訳{わけ}ありませんが、電車{でんしゃ}が遅{おく}れていて、十分{じゅっぷん}ほど遅{おく}れそうです。', 'ok', 'Excuses, raison et estimation : la structure attendue.'],
          ['マルタンです。遅{おく}れます。', 'mid', 'Compréhensible mais trop abrupt avec un supérieur : ajoutez excuses et raison.'],
          ['マルタンです。電車{でんしゃ}が遅{おく}れたから、遅{おく}れるかもしれないよ。', 'no', 'Formes neutres (遅れた, 遅れる) et よ final : registre amical inadapté avec un supérieur ; il manque aussi les excuses.']] },
        { p: '上司{じょうし}', l: 'わかりました。十時{じゅうじ}の会議{かいぎ}には間{ま}に合{あ}いそうですか。', o: [
          ['はい、九時{くじ}四十分{よんじゅっぷん}ごろには着{つ}く予定{よてい}です。', 'ok', '« 〜予定です » donne une estimation précise et rassurante.'],
          ['はい、間{ま}に合{あ}うと思{おも}います。', 'ok', 'Réponse prudente et naturelle.'],
          ['はい、間{ま}に合{あ}うつもりです。', 'mid', '« つもり » exprime une intention ; l’heure d’arrivée ne dépend pas de votre volonté : 間に合うと思います.']] },
        { p: '上司{じょうし}', l: 'では、会議{かいぎ}の資料{しりょう}は大丈夫{だいじょうぶ}ですか。', o: [
          ['資料{しりょう}は昨日{きのう}のうちに共有{きょうゆう}フォルダに入{い}れておきました。', 'ok', '« 〜ておきました » : préparé à l’avance ; « 昨日のうちに » : dès hier.'],
          ['すみません、まだできていないので、着{つ}き次第{しだい}すぐに準備{じゅんび}します。', 'ok', 'Honnête et professionnel : excuse, état, solution ; « 〜次第 » : dès que.'],
          ['資料{しりょう}は昨日{きのう}入{い}れておきます。', 'no', '昨日 exige le passé : 入れておきました.']] },
        { p: '上司{じょうし}', l: 'わかりました。気{き}をつけて来{き}てください。', o: [
          ['ありがとうございます。ご迷惑{めいわく}をおかけして申{もう}し訳{わけ}ありません。', 'ok', 'Formule d’excuse attendue en milieu professionnel.'],
          ['はい、気{き}をつけます。', 'ok', 'Naturel ; on peut ajouter des excuses.'],
          ['どういたしまして。', 'no', 'Répond à un remerciement : hors sujet ici.']] },
      ],
    },
    {
      id: 'medecin', lv: 'N3', cat: 'Vie quotidienne', reg: 'poli', t: 'Chez le médecin',
      role: 'Vous consultez un médecin pour un mal de gorge.',
      expr: [['〜から（時間）', 'depuis…'], ['咳{せき}が出{で}る', 'tousser (symptôme)'], ['〜というのは', 'qu’entendez-vous par… ?']],
      turns: [
        { p: '医者{いしゃ}', l: '今日{きょう}はどうされましたか。', o: [
          ['三日前{みっかまえ}から喉{のど}が痛{いた}くて、熱{ねつ}も少{すこ}しあります。', 'ok', 'Symptômes et durée (〜から) : clair et complet.'],
          ['喉{のど}が痛{いた}いです。', 'mid', 'Correct ; précisez depuis quand et les autres symptômes.'],
          ['喉{のど}を痛{いた}いです。', 'no', 'Avec 痛い, la partie du corps prend が : 喉が痛い.']] },
        { p: '医者{いしゃ}', l: '咳{せき}は出{で}ますか。', o: [
          ['はい、夜{よる}になるとよく出{で}ます。', 'ok', '« 〜になると » : chaque fois que la nuit vient.'],
          ['いいえ、咳{せき}は出{で}ません。', 'ok', 'Réponse négative naturelle.'],
          ['はい、咳{せき}をします。', 'mid', 'Compréhensible ; pour décrire un symptôme, on dit plutôt 咳が出ます.']] },
        { p: '医者{いしゃ}', l: '薬{くすり}のアレルギーはありますか。', o: [
          ['特{とく}にありません。', 'ok', '« 特に〜ない » : rien de particulier ; formule courante.'],
          ['ペニシリンにアレルギーがあります。', 'ok', '« 〜にアレルギーがある » : être allergique à…'],
          ['アレルギーはいません。', 'no', 'いる s’emploie pour les êtres animés ; une allergie : ありません.']] },
        { p: '医者{いしゃ}', l: 'では、薬{くすり}を出{だ}しておきますね。一日{いちにち}三回{さんかい}、食後{しょくご}に飲{の}んでください。', o: [
          ['食後{しょくご}というのは、食{た}べてすぐですか。', 'ok', 'Demander une précision avec 〜というのは : très utile.'],
          ['わかりました。ありがとうございました。', 'ok', 'Remerciement de fin de consultation : naturel.'],
          ['わかりました。薬{くすり}を食{た}べます。', 'no', 'Un médicament « se boit » : 薬を飲む.']] },
      ],
    },
    {
      id: 'entretien', lv: 'N2', cat: 'Travail', reg: 'très poli', t: 'Entretien d’embauche',
      role: 'Entretien d’embauche dans une entreprise japonaise.',
      expr: [['御社{おんしゃ}', 'votre entreprise (à l’oral)'], ['経験{けいけん}を積{つ}む', 'acquérir de l’expérience'], ['お伺{うかが}いしてもよろしいでしょうか', 'puis-je vous demander… ?']],
      turns: [
        { p: '面接官{めんせつかん}', l: '当社{とうしゃ}を志望{しぼう}された理由{りゆう}をお聞{き}かせください。', o: [
          ['御社{おんしゃ}の製品{せいひん}を長年{ながねん}使{つか}っておりまして、その開発{かいはつ}に携{たずさ}わりたいと考{かんが}えたからです。', 'ok', '御社 à l’oral, おります (humble), 携わる : le registre attendu en entretien.'],
          ['貴社{きしゃ}の製品{せいひん}が好{す}きだからです。', 'mid', '貴社 s’écrit (lettres, CV) ; à l’oral on dit 御社. « 好きだから » reste léger.'],
          ['当社{とうしゃ}の製品{せいひん}を使{つか}っているからです。', 'no', '当社 désigne sa propre entreprise : le candidat dit 御社.']] },
        { p: '面接官{めんせつかん}', l: '学生時代{がくせいじだい}に力{ちから}を入{い}れたことは何{なん}ですか。', o: [
          ['日本語{にほんご}の学習{がくしゅう}です。毎日{まいにち}続{つづ}けることで、N2に挑戦{ちょうせん}できるまでになりました。', 'ok', '« 〜ことで » (en faisant…) et « 〜までになる » (en arriver à) : un résultat concret.'],
          ['日本語{にほんご}を頑張{がんば}りました。', 'mid', 'Trop vague : donnez un exemple et un résultat.'],
          ['日本語{にほんご}の学習{がくしゅう}に力{ちから}を入{い}れてくれました。', 'no', '« 〜てくれる » signifie qu’un autre agit pour vous : contresens.']] },
        { p: '面接官{めんせつかん}', l: '入社後{にゅうしゃご}は、どのような仕事{しごと}をしたいとお考{かんが}えですか。', o: [
          ['まずは現場{げんば}で経験{けいけん}を積{つ}み、将来{しょうらい}は海外{かいがい}との橋渡{はしわた}しをする仕事{しごと}がしたいと考{かんが}えております。', 'ok', '« 経験を積む », « 橋渡し » : vocabulaire précis ; projet en deux temps.'],
          ['何{なん}でもします。', 'mid', 'Montre de la motivation mais aucun projet.'],
          ['海外{かいがい}との仕事{しごと}がしたいとお考{かんが}えです。', 'no', '« お考えです » est respectueux envers l’autre : pour soi, dites 考えております.']] },
        { p: '面接官{めんせつかん}', l: '最後{さいご}に、何{なに}か質問{しつもん}はありますか。', o: [
          ['配属{はいぞく}がいつ頃{ごろ}決{き}まるのか、お伺{うかが}いしてもよろしいでしょうか。', 'ok', 'Question pertinente, humble (お伺いする) et polie.'],
          ['特{とく}にありません。', 'mid', 'Accepté, mais une question montre votre intérêt.'],
          ['給料{きゅうりょう}はいくらですか。', 'mid', 'Question légitime mais trop directe en entretien : 「待遇{たいぐう}について伺{うかが}ってもよろしいでしょうか」.']] },
      ],
    },
    {
      id: 'debat', lv: 'N2', cat: 'Discussion', reg: 'familier', t: 'Les enfants et le smartphone',
      role: 'Discussion entre amis : à quel âge donner un smartphone à un enfant ?',
      expr: [['だからといって', 'ce n’est pas pour autant que…'], ['〜とは限{かぎ}らない', 'ce n’est pas forcément…'], ['〜にかかっている', 'dépendre de…']],
      turns: [
        { p: '友達{ともだち}', l: '最近{さいきん}、子{こ}どもにスマホを持{も}たせる親{おや}が増{ふ}えてるよね。どう思{おも}う？', o: [
          ['連絡{れんらく}が取{と}れるのは安心{あんしん}だけど、使{つか}いすぎには注意{ちゅうい}が必要{ひつよう}だと思{おも}う。', 'ok', '« 〜けど » nuance l’avis : équilibré et naturel.'],
          ['絶対{ぜったい}だめだと思{おも}います。', 'mid', 'Avis tranché, et forme polie (ます) un peu raide entre amis.'],
          ['子{こ}どもにスマホを持{も}たれるのはいいと思{おも}う。', 'no', '持たれる est un passif ; « faire avoir » se dit au causatif : 持たせる.']] },
        { p: '友達{ともだち}', l: 'でも、持{も}ってないと仲間外{なかまはず}れになるって聞{き}くよ。', o: [
          ['それはそうかもね。だからといって、小学生{しょうがくせい}に必要{ひつよう}だとは限{かぎ}らないと思{おも}うけど。', 'ok', '« だからといって » et « 〜とは限らない » : concession puis réserve, typiques du N2.'],
          ['仲間外{なかまはず}れはよくないね。', 'mid', 'Juste, mais n’apporte pas d’argument.'],
          ['それはそうだから、必要{ひつよう}だとは限{かぎ}る。', 'no', '« 〜とは限らない » s’emploie au négatif ; « 〜とは限る » n’existe pas dans ce sens.']] },
        { p: '友達{ともだち}', l: 'じゃあ、何歳{なんさい}からならいいと思{おも}う？', o: [
          ['年齢{ねんれい}よりも、使{つか}い方{かた}のルールを家族{かぞく}で決{き}められるかどうかが大事{だいじ}なんじゃないかな。', 'ok', '« 〜かどうか » et « 〜んじゃないかな » : avis prudent et naturel.'],
          ['中学生{ちゅうがくせい}からでいいんじゃない？', 'ok', 'Réponse directe et familière, naturelle entre amis.'],
          ['年齢{ねんれい}にしたがって決{き}めるべきだ。', 'mid', '« 〜にしたがって » (au fur et à mesure, conformément à) est maladroit ici ; « 年齢に応{おう}じて » conviendrait mieux.']] },
        { p: '友達{ともだち}', l: 'なるほどね。確{たし}かにルール次第{しだい}かも。', o: [
          ['うん、結局{けっきょく}は親子{おやこ}の信頼関係{しんらいかんけい}にかかってるんだと思{おも}う。', 'ok', '« 〜にかかっている » : dépendre de ; conclusion nuancée.'],
          ['そうだね、ルール次第{しだい}だね。', 'ok', 'Reprendre l’idée de l’autre pour conclure : naturel.'],
          ['うん、ルールの次第{しだい}だ。', 'no', '次第 suit directement le nom : ルール次第, sans の.']] },
      ],
    },
  ],
};
