/// <reference types="vite/client" />

// 乾坤环境变量声明
interface Window {
  __POWERED_BY_QIANKUN__?: boolean;
  __qiankun_start_options__?: any;
}