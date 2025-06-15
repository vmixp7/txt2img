import Head from "next/head";
import Link from "next/link";
import { ArrowLeft as ArrowLeftIcon } from "lucide-react";
import { Mail as MailIcon } from "lucide-react";

import appName from "./index";

export default function Privacy() {
  return (
    <div>
      <Head>
        <title>{appName}</title>
      </Head>

      <main className="container max-w-[600px] mx-auto p-5">
        <h1 className="text-center text-5xl font-bold m-6">隱私條款</h1>

        <p className="prose">
          歡迎使用我們的網站。我們非常重視您的隱私權，因此我們制定了以下隱私條款，以保護您的個人資訊：
        </p>
        <ol className="list-decimal">
          <li>收集的資訊</li>
          <p>當您使用我們的網站時，由於在網站上放送google廣告，因此第三方可能會在使用者的瀏覽器中放置並讀取 Cookie，或是使用網路信標來收集資訊。
              <a href='https://policies.google.com/technologies/partner-sites'>使用者瀏覽合作夥伴網站或使用其應用程式時，Google 將如何運用相關資料</a>
          </p>
        <li>使用的資訊</li>
        <p>我們會使用您提供的資訊，以便向您提供更好的服務。我們不會將您的個人資訊出售、交換或出租給第三方。但在以下情況下，我們可能會分享您的資訊：</p>
        <ol className="list-disc">
        <li>當法律要求我們這樣做時</li>
        <li>當我們需要與第三方合作，以提供更好的服務時。</li>
        <li>Cookie</li>
        <p>我們使用 Cookie 技術來記錄您的訪問，以便提供更好的服務。Cookie 是一種小型文本文件，它可以存儲在您的設備上。您可以在瀏覽器設置中關閉 Cookie 功能，但這可能會影響您使用我們的網站。</p>
        </ol>
        <li>安全</li>
        <p>我們採取了適當的安全措施，以保護您的個人資訊。我們使用 SSL 加密技術，以保護您的資訊不被未經授權的人員訪問。</p>
        <li>兒童隱私</li>
        <p>我們的網站不適用於未滿 18 歲的兒童。如果您是未滿 18 歲的兒童，請勿使用我們的網站。</p>
        <li>修改隱私條款</li>
        <p>我們保留隨時修改隱私條款的權利。如果我們對隱私條款進行任何更改，我們將在網站上發布更新的版本。</p>
        </ol>

        <p>如果您對本隱私政策有任何疑問，請隨時與我們聯繫。</p>
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
