import imgImage1 from "./a1454d6c1bddc9c0d186795f111c95ae9e81b779.png";

function Nav() {
  return (
    <div className="[word-break:break-word] absolute contents font-['Roboto:ExtraBold',sans-serif] font-extrabold leading-[normal] left-[1428px] text-[#96b0ff] text-[25px] text-center top-[39px] whitespace-nowrap" data-name="Nav">
      <p className="-translate-x-1/2 absolute left-[1831.5px] top-[39px]" style={{ fontVariationSettings: '"wdth" 100' }}>
        Careers
      </p>
      <p className="-translate-x-1/2 absolute left-[1711.5px] top-[39px]" style={{ fontVariationSettings: '"wdth" 100' }}>
        Blogs
      </p>
      <p className="-translate-x-1/2 absolute left-[1587px] top-[39px]" style={{ fontVariationSettings: '"wdth" 100' }}>
        Services
      </p>
      <p className="-translate-x-1/2 absolute left-[1461.5px] top-[39px]" style={{ fontVariationSettings: '"wdth" 100' }}>
        Home
      </p>
    </div>
  );
}

function Group2() {
  return (
    <div className="absolute contents left-[1398px] top-[21px]">
      <div className="absolute bg-[rgba(255,255,255,0.1)] h-[64px] left-[1398px] rounded-[50px] top-[21px] w-[502px]" />
      <Nav />
    </div>
  );
}

function Group1() {
  return (
    <a className="absolute contents cursor-pointer left-[854px] top-[982px]">
      <div className="absolute bg-[rgba(255,255,255,0.1)] h-[75px] left-[854px] rounded-[50px] top-[982px] w-[211px]" />
      <p className="-translate-x-1/2 [word-break:break-word] absolute font-['Source_Code_Pro:ExtraBold',sans-serif] font-extrabold leading-[normal] left-[960px] text-[#4876ff] text-[50px] text-center top-[988px] whitespace-nowrap">ENTER</p>
    </a>
  );
}

function Group() {
  return (
    <div className="absolute contents left-[592px] top-[398px]">
      <div className="absolute bg-[#0f4cbf] h-[355.62px] left-[592px] rounded-[80px] top-[398px] w-[667px]" />
      <div className="absolute h-[252.639px] left-[637.09px] top-[449.05px] w-[576.056px]" data-name="image 1">
        <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none size-full" src={imgImage1} />
      </div>
    </div>
  );
}

export default function SwiftClearFrontPage() {
  return (
    <div className="bg-white relative size-full" data-name="Swift Clear Front Page">
      <div className="absolute left-[-262px] size-[2443px] top-[-590px]">
        <svg className="absolute block inset-0 size-full" fill="none" height="2443" preserveAspectRatio="none" viewBox="0 0 2443 2443" width="2443">
          <circle cx="1221.5" cy="1221.5" fill="#000E37" id="Ellipse 6" r="1221.5" />
        </svg>
      </div>
      <div className="absolute left-[-58px] size-[2036px] top-[-386px]">
        <svg className="absolute block inset-0 size-full" fill="none" height="2036" preserveAspectRatio="none" viewBox="0 0 2036 2036" width="2036">
          <circle cx="1018" cy="1018" fill="#001450" id="Ellipse 5" r="1018" />
        </svg>
      </div>
      <div className="absolute left-[39px] size-[1841px] top-[-287px]">
        <svg className="absolute block inset-0 size-full" fill="none" height="1841" preserveAspectRatio="none" viewBox="0 0 1841 1841" width="1841">
          <circle cx="920.5" cy="920.5" fill="#02289C" id="Ellipse 4" r="920.5" />
        </svg>
      </div>
      <div className="absolute left-[145px] size-[1629px] top-[-183px]">
        <svg className="absolute block inset-0 size-full" fill="none" height="1629" preserveAspectRatio="none" viewBox="0 0 1629 1629" width="1629">
          <circle cx="814.5" cy="814.5" fill="#4876FF" id="Ellipse 1" r="814.5" />
        </svg>
      </div>
      <div className="absolute left-[243px] size-[1433px] top-[-85px]">
        <svg className="absolute block inset-0 size-full" fill="none" height="1433" preserveAspectRatio="none" viewBox="0 0 1433 1433" width="1433">
          <circle cx="716.5" cy="716.5" fill="#97B1FF" id="Ellipse 2" r="716.5" />
        </svg>
      </div>
      <div className="absolute left-[352px] size-[1216px] top-[26px]">
        <svg className="absolute block inset-0 size-full" fill="none" height="1216" preserveAspectRatio="none" viewBox="0 0 1216 1216" width="1216">
          <circle cx="608" cy="608" fill="#C3D2FF" id="Ellipse 3" r="608" />
        </svg>
      </div>
      <Group2 />
      <div className="-translate-x-1/2 [word-break:break-word] absolute font-['Source_Code_Pro:SemiBold','Noto_Sans:SemiBold','Noto_Sans_Math:Regular','Noto_Sans_Symbols:SemiBold','Noto_Sans_Symbols2:Regular',sans-serif] font-semibold leading-[0] left-[959.5px] text-[25px] text-center text-shadow-[0px_4px_4px_rgba(0,0,0,0.4)] text-white top-[859px] w-[725px] whitespace-pre-wrap">
        <p className="leading-[normal] mb-0">{`It's not only disinfection; It's about safety, `}</p>
        <p className="leading-[normal]">{`protection & saving lives. Leave it to the expert!`}</p>
      </div>
      <p className="-translate-x-1/2 [word-break:break-word] absolute font-['Source_Code_Pro:ExtraBold',sans-serif] font-extrabold leading-[normal] left-[960.5px] text-[65px] text-center text-shadow-[0px_7px_4px_rgba(0,0,0,0.3)] text-white top-[774px] whitespace-nowrap">It Matters.</p>
      <Group1 />
      <Group />
    </div>
  );
}