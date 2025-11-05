/**
 * SVG插画组件库
 *
 * 用途：
 * 1. 提供统一的现代化插画
 * 2. 用于EmptyState、错误页等场景
 * 3. 插画来源：unDraw (https://undraw.co) - MIT License
 */
import type { SVGProps } from 'react';

interface IllustrationProps extends SVGProps<SVGSVGElement> {
  /** 插画尺寸 */
  size?: number;
}

/**
 * 空状态插画
 * 使用场景：通用空状态、无数据
 */
export function EmptyIllustration({ size = 200, ...props }: IllustrationProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 647.63626 632.17383"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        d="M687.3279,276.08691H512.81813a15.01828,15.01828,0,0,0-15,15v387.85l-2,.61005-42.81006,13.11a8.00676,8.00676,0,0,1-9.98974-5.31L315.678,271.39691a8.00313,8.00313,0,0,1,5.31006-9.99l65.97022-20.2,191.25-58.54,65.96972-20.2a7.98927,7.98927,0,0,1,9.99024,5.3l32.5498,106.32Z"
        transform="translate(-276.18187 -133.91309)"
        fill="#f2f2f2"
      />
      <path
        d="M725.408,274.08691l-39.23-128.14a16.99368,16.99368,0,0,0-21.23-11.28l-92.75,28.39L380.95827,221.60693l-92.75,28.4a17.0152,17.0152,0,0,0-11.28028,21.23l134.08008,437.93a17.02661,17.02661,0,0,0,16.26026,12.03,16.78926,16.78926,0,0,0,4.96972-.75l63.58008-19.46,2-.62v-2.09l-2,.61-64.16992,19.65a15.01489,15.01489,0,0,1-18.73-9.95l-134.06006-437.94a14.97935,14.97935,0,0,1,9.94971-18.73l92.75-28.4,191.24024-58.54,92.75-28.4a15.15551,15.15551,0,0,1,4.40966-.66,15.01461,15.01461,0,0,1,14.32032,10.61l39.0498,127.56.62012,2h2.08008Z"
        transform="translate(-276.18187 -133.91309)"
        fill="#3f3d56"
      />
      <path
        d="M398.86279,261.73389a9.0157,9.0157,0,0,1-8.61133-6.3667l-12.88037-42.07178a8.99884,8.99884,0,0,1,5.9712-11.24023l175.939-53.86377a9.00867,9.00867,0,0,1,11.24072,5.9707l12.88037,42.07227a9.01029,9.01029,0,0,1-5.9707,11.24072L401.49219,261.33887A8.976,8.976,0,0,1,398.86279,261.73389Z"
        transform="translate(-276.18187 -133.91309)"
        fill="#6c63ff"
      />
      <circle cx="190.15351" cy="24.95465" r="20" fill="#6c63ff" />
      <circle cx="190.15351" cy="24.95465" r="12.66462" fill="#fff" />
      <path
        d="M878.81836,716.08691h-338a8.50981,8.50981,0,0,1-8.5-8.5v-405a8.50951,8.50951,0,0,1,8.5-8.5h338a8.50982,8.50982,0,0,1,8.5,8.5v405A8.51013,8.51013,0,0,1,878.81836,716.08691Z"
        transform="translate(-276.18187 -133.91309)"
        fill="#e6e6e6"
      />
      <path
        d="M723.31813,274.08691h-210.5a17.02411,17.02411,0,0,0-17,17v407.8l2-.61v-407.19a15.01828,15.01828,0,0,1,15-15H723.93825Zm183.5,0h-394a17.02411,17.02411,0,0,0-17,17v458a17.0241,17.0241,0,0,0,17,17h394a17.0241,17.0241,0,0,0,17-17v-458A17.02411,17.02411,0,0,0,906.81813,274.08691Zm15,475a15.01828,15.01828,0,0,1-15,15h-394a15.01828,15.01828,0,0,1-15-15v-458a15.01828,15.01828,0,0,1,15-15h394a15.01828,15.01828,0,0,1,15,15Z"
        transform="translate(-276.18187 -133.91309)"
        fill="#3f3d56"
      />
      <path
        d="M801.81836,318.08691h-184a9.01015,9.01015,0,0,1-9-9v-44a9.01016,9.01016,0,0,1,9-9h184a9.01016,9.01016,0,0,1,9,9v44A9.01015,9.01015,0,0,1,801.81836,318.08691Z"
        transform="translate(-276.18187 -133.91309)"
        fill="#6c63ff"
      />
      <circle cx="433.63626" cy="105.17383" r="20" fill="#6c63ff" />
      <circle cx="433.63626" cy="105.17383" r="12.18187" fill="#fff" />
    </svg>
  );
}

/**
 * 404插画
 * 使用场景：页面未找到
 */
export function NotFoundIllustration({ size = 200, ...props }: IllustrationProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 1120.59226 777.91584"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <circle cx="212.59226" cy="103" r="64" fill="#ff6584" />
      <path
        d="M563.68016,404.16381c0,151.01141-89.77389,203.73895-200.51559,203.73895S162.649,555.17522,162.649,404.16381,363.16457,61.04208,363.16457,61.04208,563.68016,253.1524,563.68016,404.16381Z"
        transform="translate(-39.70387 -61.04208)"
        fill="#f2f2f2"
      />
      <polygon
        points="221.296 474.175 217.209 474.175 215.253 428.015 221.296 428.015 221.296 474.175"
        fill="#ffb8b8"
      />
      <path
        d="M213.68766,478.96664h23.64387a0,0,0,0,1,0,0v14.88687a0,0,0,0,1,0,0H198.80078a0,0,0,0,1,0,0v0A14.88688,14.88688,0,0,1,213.68766,478.96664Z"
        fill="#2f2e41"
      />
      <polygon
        points="138.696 474.175 134.609 474.175 132.653 428.015 138.696 428.015 138.696 474.175"
        fill="#ffb8b8"
      />
      <path
        d="M131.08766,478.96664h23.64387a0,0,0,0,1,0,0v14.88687a0,0,0,0,1,0,0H116.20078a0,0,0,0,1,0,0v0A14.88688,14.88688,0,0,1,131.08766,478.96664Z"
        fill="#2f2e41"
      />
      <path
        d="M123.56843,420.93658l0,0a11.32148,11.32148,0,0,1,10.93145,8.31929l9.41084,40.41888a8,8,0,0,1-7.77742,9.96684H121.81084a8,8,0,0,1-7.77742-9.96684l9.41084-40.41888A11.32148,11.32148,0,0,1,123.56843,420.93658Z"
        transform="translate(-39.70387 -61.04208)"
        fill="#2f2e41"
      />
      <path
        d="M206.56843,420.93658l0,0a11.32148,11.32148,0,0,1,10.93145,8.31929l9.41084,40.41888a8,8,0,0,1-7.77742,9.96684H204.81084a8,8,0,0,1-7.77742-9.96684l9.41084-40.41888A11.32148,11.32148,0,0,1,206.56843,420.93658Z"
        transform="translate(-39.70387 -61.04208)"
        fill="#2f2e41"
      />
      <circle cx="180.19341" cy="77.37155" r="24.56103" fill="#ffb8b8" />
      <path
        d="M221.80087,189.39015a10.52681,10.52681,0,0,1,1.38764-.27633l44.8523-19.90389,4.91568-15.55282,17.33313,12.60365-7.61644,24.63616a8,8,0,0,1-10.33766,5.24036l-48.92558-14.285a10.5,10.5,0,1,1-1.60907,7.55788Z"
        transform="translate(-39.70387 -61.04208)"
        fill="#ffb8b8"
      />
      <path
        d="M169.41648,128.42361a10.52589,10.52589,0,0,1-.42583,1.43795l-23.47278,42.87917-15.96814,2.43121,7.34528-17.99954,15.19839-31.71045a8,8,0,0,1,11.41074-3.14939l14.43491,8.33391a10.5,10.5,0,1,1-8.52257-2.22286Z"
        transform="translate(-39.70387 -61.04208)"
        fill="#ffb8b8"
      />
      <polygon
        points="149.896 222.175 142.896 222.175 139.546 182.015 149.896 182.015 149.896 222.175"
        fill="#6c63ff"
      />
    </svg>
  );
}

/**
 * 无权限插画
 * 使用场景：403、无访问权限
 */
export function NoAccessIllustration({ size = 200, ...props }: IllustrationProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 820.16 780.81"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <defs>
        <linearGradient id="noAccessGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#667eea" />
          <stop offset="100%" stopColor="#764ba2" />
        </linearGradient>
      </defs>
      <path
        d="M433.12,670.63c-62.63,0-113.56-50.93-113.56-113.56s50.93-113.56,113.56-113.56,113.56,50.93,113.56,113.56-50.93,113.56-113.56,113.56Zm0-215.12c-55.99,0-101.56,45.57-101.56,101.56s45.57,101.56,101.56,101.56,101.56-45.57,101.56-101.56-45.57-101.56-101.56-101.56Z"
        transform="translate(-189.92 -59.59)"
        fill="#ccc"
      />
      <rect
        x="484.12"
        y="503.82"
        width="12"
        height="186.31"
        transform="translate(-255.38 -122.72) rotate(-45)"
        fill="url(#noAccessGradient)"
      />
      <path
        d="M729.68,785.78H284.32c-26.47,0-48-21.53-48-48V197.82c0-26.47,21.53-48,48-48h445.36c26.47,0,48,21.53,48,48v539.96c0,26.47-21.53,48-48,48ZM284.32,161.82c-19.85,0-36,16.15-36,36v539.96c0,19.85,16.15,36,36,36h445.36c19.85,0,36-16.15,36-36V197.82c0-19.85-16.15-36-36-36H284.32Z"
        transform="translate(-189.92 -59.59)"
        fill="#3f3d56"
      />
      <rect x="106.4" y="120.33" width="607.76" height="12" fill="#3f3d56" />
      <circle cx="148.57" cy="96.33" r="18" fill="#ff6584" />
      <circle cx="199.57" cy="96.33" r="18" fill="#6c63ff" />
      <circle cx="250.57" cy="96.33" r="18" fill="#a0616a" />
    </svg>
  );
}

/**
 * 错误插画
 * 使用场景：系统错误、500错误
 */
export function ErrorIllustration({ size = 200, ...props }: IllustrationProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 820.16 780.81"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <defs>
        <linearGradient id="errorGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#ff6584" />
          <stop offset="100%" stopColor="#e63946" />
        </linearGradient>
      </defs>
      <circle cx="410.08" cy="493.48" r="172.9" fill="#f2f2f2" />
      <path
        d="M614,623.33H262.85a17.07,17.07,0,0,1-17-17v-359a17.07,17.07,0,0,1,17-17H614a17.07,17.07,0,0,1,17,17v359A17.07,17.07,0,0,1,614,623.33Z"
        transform="translate(-189.92 -59.59)"
        fill="#3f3d56"
      />
      <rect x="86.93" y="198.74" width="409.6" height="237.57" fill="url(#errorGradient)" />
      <circle cx="291.73" cy="78.33" r="24" fill="#6c63ff" />
      <path
        d="M481.65,137.92a6,6,0,1,1,6-6A6,6,0,0,1,481.65,137.92Z"
        transform="translate(-189.92 -59.59)"
        fill="#fff"
      />
      <path
        d="M507.65,137.92a6,6,0,1,1,6-6A6,6,0,0,1,507.65,137.92Z"
        transform="translate(-189.92 -59.59)"
        fill="#fff"
      />
      <path
        d="M533.65,137.92a6,6,0,1,1,6-6A6,6,0,0,1,533.65,137.92Z"
        transform="translate(-189.92 -59.59)"
        fill="#fff"
      />
      <rect x="199.73" y="282.33" width="12" height="115.94" rx="6" fill="#fff" />
      <rect x="223.67" y="334.27" width="115.94" height="12" rx="6" transform="translate(-334.34 61.71) rotate(-45)" fill="#fff" />
      <rect x="223.67" y="334.27" width="115.94" height="12" rx="6" transform="translate(121.58 605.5) rotate(-135)" fill="#fff" />
    </svg>
  );
}

/**
 * 无搜索结果插画
 * 使用场景：搜索无结果
 */
export function NoSearchResultIllustration({ size = 200, ...props }: IllustrationProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 647.63 632.17"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <circle cx="324" cy="324" r="200" fill="#f2f2f2" />
      <circle cx="324" cy="324" r="170" fill="#fff" />
      <circle cx="324" cy="324" r="140" fill="#f2f2f2" opacity="0.5" />
      <path
        d="M520.13,483.67a80,80,0,1,0-113.13,0L345.28,545.4a13.34,13.34,0,1,0,18.85,18.85l61.73-61.73a79.61,79.61,0,0,0,32.54,0l61.73,61.73a13.34,13.34,0,0,0,18.85-18.85Z"
        transform="translate(-276.18 -133.91)"
        fill="#6c63ff"
      />
      <circle cx="188" cy="270" r="70" fill="#fff" stroke="#6c63ff" strokeWidth="4" />
      <line
        x1="235"
        y1="317"
        x2="285"
        y2="367"
        stroke="#6c63ff"
        strokeWidth="12"
        strokeLinecap="round"
      />
    </svg>
  );
}

/**
 * Loading加载插画
 * 使用场景：数据加载中
 */
export function LoadingIllustration({ size = 200, ...props }: IllustrationProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 200 200"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <defs>
        <linearGradient id="loadingGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#667eea" />
          <stop offset="100%" stopColor="#764ba2" />
        </linearGradient>
      </defs>
      {/* 背景圆 */}
      <circle cx="100" cy="100" r="80" fill="#f3f4f6" opacity="0.3" />
      {/* 旋转的圆环 */}
      <circle
        cx="100"
        cy="100"
        r="60"
        fill="none"
        stroke="url(#loadingGradient)"
        strokeWidth="8"
        strokeLinecap="round"
        strokeDasharray="283"
        strokeDashoffset="75"
      >
        <animateTransform
          attributeName="transform"
          type="rotate"
          from="0 100 100"
          to="360 100 100"
          dur="1.5s"
          repeatCount="indefinite"
        />
      </circle>
      {/* 中心点 */}
      <circle cx="100" cy="100" r="8" fill="url(#loadingGradient)" opacity="0.8">
        <animate attributeName="r" values="8;12;8" dur="1s" repeatCount="indefinite" />
      </circle>
    </svg>
  );
}

/**
 * Success成功插画
 * 使用场景：操作成功、完成状态
 */
export function SuccessIllustration({ size = 200, ...props }: IllustrationProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 200 200"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <defs>
        <linearGradient id="successGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#10b981" />
          <stop offset="100%" stopColor="#059669" />
        </linearGradient>
      </defs>
      {/* 背景圆 */}
      <circle cx="100" cy="100" r="80" fill="#10b981" opacity="0.1" />
      {/* 主圆 */}
      <circle cx="100" cy="100" r="60" fill="url(#successGradient)" opacity="0.2" />
      {/* 对号 */}
      <path
        d="M70 100 L90 120 L130 75"
        fill="none"
        stroke="#10b981"
        strokeWidth="12"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <animate
          attributeName="stroke-dasharray"
          from="0 100"
          to="100 100"
          dur="0.6s"
          fill="freeze"
        />
      </path>
      {/* 装饰星星 */}
      <g opacity="0.6">
        <circle cx="140" cy="60" r="3" fill="#10b981">
          <animate attributeName="opacity" values="0.6;1;0.6" dur="2s" repeatCount="indefinite" />
        </circle>
        <circle cx="60" cy="140" r="2" fill="#10b981">
          <animate
            attributeName="opacity"
            values="0.6;1;0.6"
            dur="2s"
            begin="0.5s"
            repeatCount="indefinite"
          />
        </circle>
        <circle cx="150" cy="140" r="2.5" fill="#10b981">
          <animate
            attributeName="opacity"
            values="0.6;1;0.6"
            dur="2s"
            begin="1s"
            repeatCount="indefinite"
          />
        </circle>
      </g>
    </svg>
  );
}

/**
 * Congratulation庆祝插画
 * 使用场景：重要成就、里程碑
 */
export function CongratulationIllustration({ size = 200, ...props }: IllustrationProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 200 200"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <defs>
        <linearGradient id="trophyGradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#fbbf24" />
          <stop offset="100%" stopColor="#f59e0b" />
        </linearGradient>
      </defs>
      {/* 庆祝背景 */}
      <circle cx="100" cy="100" r="80" fill="#fef3c7" opacity="0.3" />
      {/* 奖杯 */}
      <g transform="translate(100 100)">
        {/* 杯身 */}
        <path
          d="M-25,-20 L-30,-40 L30,-40 L25,-20 L20,0 L-20,0 Z"
          fill="url(#trophyGradient)"
          stroke="#d97706"
          strokeWidth="2"
        />
        {/* 杯耳左 */}
        <path d="M-30,-35 Q-45,-35 -45,-25 Q-45,-15 -30,-15" fill="none" stroke="#d97706" strokeWidth="2" />
        {/* 杯耳右 */}
        <path d="M30,-35 Q45,-35 45,-25 Q45,-15 30,-15" fill="none" stroke="#d97706" strokeWidth="2" />
        {/* 底座 */}
        <rect x="-15" y="0" width="30" height="8" fill="#d97706" />
        <rect x="-20" y="8" width="40" height="4" fill="#d97706" rx="2" />
        {/* 星星装饰 */}
        <text
          x="-2"
          y="-25"
          fontSize="20"
          fill="#fff"
          fontWeight="bold"
          textAnchor="middle"
        >
          ★
        </text>
      </g>
      {/* 彩带 */}
      <g opacity="0.7">
        {[...Array(8)].map((_, i) => (
          <line
            key={i}
            x1="100"
            y1="30"
            x2={100 + Math.cos((i * Math.PI) / 4) * 70}
            y2={30 + Math.sin((i * Math.PI) / 4) * 70}
            stroke={i % 2 === 0 ? '#f59e0b' : '#fbbf24'}
            strokeWidth="2"
            strokeDasharray="4 4"
          >
            <animate
              attributeName="stroke-dashoffset"
              from="0"
              to="8"
              dur="1s"
              repeatCount="indefinite"
            />
          </line>
        ))}
      </g>
    </svg>
  );
}
