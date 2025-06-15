import Head from "next/head";
import Link from "next/link";
import { ArrowLeft as ArrowLeftIcon } from "lucide-react";
import { Mail as MailIcon } from "lucide-react";

import appName from "./index";

export default function About() {
  return (
    <div>
      <Head>
        <title>{appName}</title>
      </Head>

      <main className="container max-w-[600px] mx-auto p-5">
        <h1 className="text-center text-5xl font-bold m-6">使用條款</h1>

        <p className="prose">
          歡迎使用我們的網站。請在使用本網站前仔細閱讀以下使用條款。使用本網站即表示您同意遵守以下條款和條件：
        </p>
        <ol className="list-decimal">
        <li>使用限制本網站僅供個人使用，不得用於商業目的。您不得將本網站用於非法目的或以任何方式侵犯他人的權利。</li>
        <li>內容所有權本網站上的所有內容，包括但不限於文字、圖片、音頻、視頻、軟件、程式碼和其他資料，均受版權、商標和其他知識產權法律的保護。未經我們的書面許可，您不得以任何形式使用、複製、修改、傳播、出售或分發本網站上的任何內容。</li>
        <li>使用者責任您必須對您在本網站上的行為負責。您不得在本網站製作任何非法、淫穢、誹謗、侵犯他人隱私或其他不當的內容。您不得對本網站進行任何未經授權的訪問或企圖破壞本網站的安全性。</li>
        <li>本網站遵循兒童及少年福利與權益保障法，嚴禁製作含有兒童裸體，兒童色情相關之內容，如違反者將自行負起法律責任。</li>
        <li>免責聲明本網站上的所有內容僅供參考和信息之用，不構成任何形式的建議或保證。我們不對本網站上的任何內容的準確性、完整性、可靠性、適用性或可用性作出任何保證或陳述。我們不對因使用本網站而導致的任何損失或損害負責。</li>
        <li>連結到第三方網站本網站可能包含指向第三方網站的連結。這些連結僅為方便之用，並不表示我們對這些網站的內容或可靠性作出任何保證或陳述。我們不對因使用或依賴這些網站而導致的任何損失或損害負責。</li>
        <li>修改和終止我們保留隨時修改或終止本網站的權利，恕不另行通知。我們不對因修改或終止本網站而導致的任何損失或損害負責。</li>
        <li>隱私政策我們尊重您的隱私權，並根據我們的隱私政策處理您的個人信息。請在使用本網站前仔細閱讀我們的隱私政策。</li>
        <li>爭議解決本使用條款受中華人民共和國法律管轄。任何因使用本網站而引起的爭議應當通過友好協商解決。如果協商不成，任何一方均有權向有管轄權的法院提起訴訟。</li>
        </ol>

        <div className="text-center mt-10">
            <p>
              <MailIcon className="icon" />
                www.sexygirl.ai@gmail.com
            </p>
        </div>
        
        <div className="text-center mt-10">
          <Link href="/">
            <a className="bg-black text-white rounded-md text-small inline-block p-3 flex-none">
              <ArrowLeftIcon className="icon" />
              Back to painting
            </a>
          </Link>
        </div>
      </main>
    </div>
  );
}
