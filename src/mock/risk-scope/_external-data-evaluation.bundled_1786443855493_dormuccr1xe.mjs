// ../../src/mock/risk-scope/external-data-evaluation.ts
var now = (/* @__PURE__ */ new Date()).toISOString();
var supplierProductsMock = [
  { id: "SP-001-EXTERNAL_PART_1", supplierId: "SUP-001", productId: "P-EXTERNAL_PART_1", productCode: "EXTERNAL_PART_1", productName: "\u5916\u6570\u52061", category: "DATA", status: "active", interfaceCount: 1, hasContract: true, createdAt: now, updatedAt: now },
  { id: "SP-001-EXTERNAL_PART_2", supplierId: "SUP-001", productId: "P-EXTERNAL_PART_2", productCode: "EXTERNAL_PART_2", productName: "\u5916\u6570\u52062", category: "DATA", status: "active", interfaceCount: 1, hasContract: true, createdAt: now, updatedAt: now },
  { id: "SP-001-VERIFY_PART_1", supplierId: "SUP-001", productId: "P-VERIFY_PART_1", productCode: "VERIFY_PART_1", productName: "\u6838\u9A8C\u52061", category: "DATA", status: "active", interfaceCount: 1, hasContract: true, createdAt: now, updatedAt: now },
  { id: "SP-001-VERIFY_PART_2", supplierId: "SUP-001", productId: "P-VERIFY_PART_2", productCode: "VERIFY_PART_2", productName: "\u6838\u9A8C\u52062", category: "DATA", status: "active", interfaceCount: 1, hasContract: true, createdAt: now, updatedAt: now },
  { id: "SP-001-SPECIAL_BUNDLE", supplierId: "SUP-001", productId: "P-SPECIAL_BUNDLE", productCode: "SPECIAL_BUNDLE", productName: "\u7279\u6B8A\u8BA1\u8D39\u5305", category: "SPECIAL", status: "active", interfaceCount: 1, hasContract: true, createdAt: now, updatedAt: now },
  { id: "SP-001-EXT_FIX_01", supplierId: "SUP-001", productId: "P-EXT_FIX_01", productCode: "EXT_FIX_01", productName: "\u5916\u6570\u520601", category: "DATA", status: "active", interfaceCount: 1, hasContract: true, createdAt: now, updatedAt: now },
  { id: "SP-001-EXT_FIX_02", supplierId: "SUP-001", productId: "P-EXT_FIX_02", productCode: "EXT_FIX_02", productName: "\u5916\u6570\u520602", category: "DATA", status: "active", interfaceCount: 1, hasContract: true, createdAt: now, updatedAt: now },
  { id: "SP-001-EXT_FIX_03", supplierId: "SUP-001", productId: "P-EXT_FIX_03", productCode: "EXT_FIX_03", productName: "\u5916\u6570\u520603", category: "DATA", status: "active", interfaceCount: 1, hasContract: true, createdAt: now, updatedAt: now },
  { id: "SP-001-EXT_FIX_04", supplierId: "SUP-001", productId: "P-EXT_FIX_04", productCode: "EXT_FIX_04", productName: "\u5916\u6570\u520604", category: "DATA", status: "active", interfaceCount: 1, hasContract: true, createdAt: now, updatedAt: now },
  { id: "SP-001-EXT_FIX_05", supplierId: "SUP-001", productId: "P-EXT_FIX_05", productCode: "EXT_FIX_05", productName: "\u5916\u6570\u520605", category: "DATA", status: "active", interfaceCount: 1, hasContract: true, createdAt: now, updatedAt: now },
  // ... 保留部分核心数据以减少文件体积，若需要全量可追加
  { id: "SP-002-EXTERNAL_PART_3", supplierId: "SUP-002", productId: "P-EXTERNAL_PART_3", productCode: "EXTERNAL_PART_3", productName: "\u5916\u6570\u52063", category: "DATA", status: "active", interfaceCount: 1, hasContract: true, createdAt: now, updatedAt: now },
  { id: "SP-003-MAP_TILE", supplierId: "SUP-003", productId: "P-MAP_TILE", productCode: "MAP_TILE", productName: "\u5730\u56FE\u74E6\u7247", category: "MAP", status: "active", interfaceCount: 1, hasContract: true, createdAt: now, updatedAt: now },
  { id: "SP-004-ROUTE_PLAN", supplierId: "SUP-004", productId: "P-ROUTE_PLAN", productCode: "ROUTE_PLAN", productName: "\u8DEF\u7EBF\u89C4\u5212", category: "LBS", status: "active", interfaceCount: 2, hasContract: true, createdAt: now, updatedAt: now }
];
var generateEvaluationReports = (count = 20) => {
  const statuses = ["draft", "in_progress", "completed", "archived"];
  const reportTypes = ["quality", "performance", "cost_effectiveness", "comprehensive"];
  const analysisTypes = ["\u5468\u671F\u6027\u5206\u6790", "\u5B9E\u65F6\u5206\u6790", "\u6279\u91CF\u5206\u6790"];
  const reports = [];
  const fixedReports = [
    {
      id: 11,
      title: "\u4EA7\u54C1A\u8D28\u91CF\u8BC4\u4F30\u62A5\u544A_20241201",
      reportName: "\u4EA7\u54C1A\u8D28\u91CF\u8BC4\u4F30\u62A5\u544A_20241201",
      type: "quality",
      reportType: "quality",
      analysisType: "\u5468\u671F\u6027\u5206\u6790",
      generateDate: "2024-12-01",
      createdAt: "2024-12-01T10:00:00.000Z",
      status: "completed",
      score: 85,
      progress: 100,
      sampleTimeSpan: "2024-11-01 \u81F3 2024-11-30",
      templateType: "\u6807\u51C6\u6A21\u677F",
      analysisTime: "2024-12-01 10:30:00",
      failureReason: null
    },
    {
      id: 10,
      title: "\u4EA7\u54C1A\u7EFC\u5408\u8BC4\u4F30\u62A5\u544A_20241207",
      reportName: "\u4EA7\u54C1A\u7EFC\u5408\u8BC4\u4F30\u62A5\u544A_20241207",
      type: "comprehensive",
      reportType: "comprehensive",
      analysisType: "\u5468\u671F\u6027\u5206\u6790",
      generateDate: "2024-12-07",
      createdAt: "2024-12-07T09:00:00.000Z",
      status: "draft",
      score: 0,
      progress: 0,
      sampleTimeSpan: "2024-11-01 \u81F3 2024-11-30",
      templateType: "\u6807\u51C6\u6A21\u677F",
      analysisTime: null,
      failureReason: null
    },
    {
      id: 12,
      title: "\u4EA7\u54C1B\u6027\u80FD\u8BC4\u4F30\u62A5\u544A_20241202",
      reportName: "\u4EA7\u54C1B\u6027\u80FD\u8BC4\u4F30\u62A5\u544A_20241202",
      type: "performance",
      reportType: "performance",
      analysisType: "\u5B9E\u65F6\u5206\u6790",
      generateDate: "2024-12-02",
      createdAt: "2024-12-02T14:00:00.000Z",
      status: "in_progress",
      score: 60,
      progress: 65,
      sampleTimeSpan: "2024-11-15 \u81F3 2024-12-02",
      templateType: "\u81EA\u5B9A\u4E49\u6A21\u677F",
      analysisTime: null,
      failureReason: null
    },
    {
      id: 13,
      title: "\u4EA7\u54C1C\u6027\u4EF7\u6BD4\u8BC4\u4F30\u62A5\u544A_20241203",
      reportName: "\u4EA7\u54C1C\u6027\u4EF7\u6BD4\u8BC4\u4F30\u62A5\u544A_20241203",
      type: "cost_effectiveness",
      reportType: "cost_effectiveness",
      analysisType: "\u6279\u91CF\u5206\u6790",
      generateDate: "2024-12-03",
      createdAt: "2024-12-03T11:00:00.000Z",
      status: "archived",
      score: 92,
      progress: 100,
      sampleTimeSpan: "2024-10-01 \u81F3 2024-11-30",
      templateType: "\u6807\u51C6\u6A21\u677F",
      analysisTime: "2024-12-03 15:45:00",
      failureReason: null
    },
    {
      id: 14,
      title: "\u4EA7\u54C1D\u7EFC\u5408\u8BC4\u4F30\u62A5\u544A_20241204",
      reportName: "\u4EA7\u54C1D\u7EFC\u5408\u8BC4\u4F30\u62A5\u544A_20241204",
      type: "comprehensive",
      reportType: "comprehensive",
      analysisType: "\u5468\u671F\u6027\u5206\u6790",
      generateDate: "2024-12-04",
      createdAt: "2024-12-04T16:00:00.000Z",
      status: "completed",
      score: 88,
      progress: 100,
      sampleTimeSpan: "2024-11-01 \u81F3 2024-11-30",
      templateType: "\u6807\u51C6\u6A21\u677F",
      analysisTime: "2024-12-04 14:20:00",
      failureReason: null
    },
    {
      id: 15,
      title: "\u4EA7\u54C1A\u5B9E\u65F6\u6027\u80FD\u8BC4\u4F30_20241205",
      reportName: "\u4EA7\u54C1A\u5B9E\u65F6\u6027\u80FD\u8BC4\u4F30_20241205",
      type: "performance",
      reportType: "performance",
      analysisType: "\u5B9E\u65F6\u5206\u6790",
      generateDate: "2024-12-05",
      createdAt: "2024-12-05T08:30:00.000Z",
      status: "draft",
      score: 0,
      progress: 0,
      sampleTimeSpan: "2024-12-01 \u81F3 2024-12-05",
      templateType: "\u81EA\u5B9A\u4E49\u6A21\u677F",
      analysisTime: null,
      failureReason: null
    }
  ];
  reports.push(...fixedReports);
  for (let i = reports.length; i < count; i++) {
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    const type = reportTypes[Math.floor(Math.random() * reportTypes.length)];
    const analysisType = analysisTypes[Math.floor(Math.random() * analysisTypes.length)];
    const date = /* @__PURE__ */ new Date();
    date.setDate(date.getDate() - Math.floor(Math.random() * 30));
    const dateStr = date.toISOString().split("T")[0];
    const createdAt = date.toISOString();
    let progress = 0;
    let score = 0;
    if (status === "completed" || status === "archived") {
      progress = 100;
      score = Math.floor(Math.random() * 40) + 60;
    } else if (status === "in_progress") {
      progress = Math.floor(Math.random() * 90) + 10;
      score = 0;
    }
    reports.push({
      id: i + 1,
      title: `${type === "quality" ? "\u8D28\u91CF" : type === "performance" ? "\u6027\u80FD" : type === "cost_effectiveness" ? "\u6027\u4EF7\u6BD4" : "\u7EFC\u5408"}\u8BC4\u4F30\u62A5\u544A_${dateStr.replace(/-/g, "")}_${i}`,
      reportName: `${type}\u8BC4\u4F30\u62A5\u544A_${dateStr.replace(/-/g, "")}`,
      type,
      reportType: type,
      analysisType,
      generateDate: dateStr,
      createdAt,
      status,
      score,
      progress,
      sampleTimeSpan: `${dateStr} \u81F3 ${(/* @__PURE__ */ new Date()).toISOString().split("T")[0]}`,
      templateType: Math.random() > 0.5 ? "\u6807\u51C6\u6A21\u677F" : "\u81EA\u5B9A\u4E49\u6A21\u677F",
      analysisTime: status === "completed" || status === "archived" ? `${dateStr} ${Math.floor(Math.random() * 24).toString().padStart(2, "0")}:${Math.floor(Math.random() * 60).toString().padStart(2, "0")}:00` : null,
      failureReason: null
    });
  }
  return reports;
};
var generateEditableReportDetail = (reportId) => {
  return {
    id: reportId,
    reportName: "\u4EA7\u54C1A\u5B8C\u6574\u6548\u679C\u8BC4\u4F30\u62A5\u544A_20241207",
    productName: "\u4EA7\u54C1A",
    reportType: "\u4EA7\u54C1\u7EA7\u6548\u679C\u8BC4\u4F30",
    analysisType: "\u5468\u671F\u6027\u5206\u6790",
    generateDate: "2024-12-07",
    status: "\u8349\u7A3F",
    progress: 100,
    sampleTimeSpan: "2024-11-01 \u81F3 2024-11-30",
    templateType: "\u5916\u6570\u8BC4\u4F30-\u4EA7\u54C1\u7EA7\u5206\u6790\u62A5\u544A\u6A21\u677F",
    templateId: "template_external_product_mvp",
    analysisTime: "2024-12-07 16:30:00",
    failureReason: null,
    // 报告级别的编辑权限
    editable: true,
    // 产品注册状态
    productRegistrationStatus: "registered",
    // 报告的7个固定模块（符合需求文档）
    modules: [
      {
        id: 1,
        name: "\u6D4B\u8BD5\u80CC\u666F\u53CA\u76EE\u7684",
        type: "text",
        editType: "text_only",
        status: "completed",
        editable: true,
        content: "\u672C\u6B21\u6D4B\u8BD5\u65E8\u5728\u8BC4\u4F30\u4EA7\u54C1A\u5728\u5916\u90E8\u6570\u636E\u6295\u653E\u4E2D\u7684\u6548\u679C\u8868\u73B0\u3002\u901A\u8FC7\u5BF92024\u5E7411\u6708\u671F\u95F4\u7684\u6295\u653E\u6570\u636E\u8FDB\u884C\u5168\u9762\u5206\u6790\uFF0C\u8BC4\u4F30\u4EA7\u54C1\u5728\u4E0D\u540C\u5E73\u53F0\u7684\u8F6C\u5316\u6548\u679C\u3001\u7528\u6237\u8D28\u91CF\u548CROI\u8868\u73B0\uFF0C\u4E3A\u540E\u7EED\u6295\u653E\u7B56\u7565\u4F18\u5316\u63D0\u4F9B\u6570\u636E\u652F\u6491\u3002\u6D4B\u8BD5\u91CD\u70B9\u5173\u6CE8\u4EA7\u54C1\u7684\u6838\u5FC3\u8F6C\u5316\u6307\u6807\uFF0C\u5305\u62EC\u70B9\u51FB\u7387\u3001\u8F6C\u5316\u7387\u3001\u83B7\u5BA2\u6210\u672C\u7B49\u5173\u952E\u6307\u6807\u7684\u8868\u73B0\u60C5\u51B5\u3002",
        wordLimit: 500,
        lastModified: "2024-12-07 16:30:00"
      },
      {
        id: 2,
        name: "\u4EA7\u54C1\u4ECB\u7ECD",
        type: "text",
        editType: "text_only",
        status: "completed",
        editable: true,
        content: "\u4EA7\u54C1A\u662F\u4E00\u6B3E\u9762\u5411\u4E2D\u5C0F\u4F01\u4E1A\u7684\u91D1\u878D\u670D\u52A1\u4EA7\u54C1\uFF0C\u4E3B\u8981\u529F\u80FD\u5305\u62EC\u4FE1\u7528\u8BC4\u4F30\u3001\u98CE\u9669\u63A7\u5236\u548C\u8D44\u91D1\u5339\u914D\u3002\u4EA7\u54C1\u901A\u8FC7\u5927\u6570\u636E\u5206\u6790\u548C\u673A\u5668\u5B66\u4E60\u7B97\u6CD5\uFF0C\u4E3A\u4E2D\u5C0F\u4F01\u4E1A\u63D0\u4F9B\u5FEB\u901F\u3001\u51C6\u786E\u7684\u4FE1\u7528\u8BC4\u4F30\u670D\u52A1\uFF0C\u5E2E\u52A9\u91D1\u878D\u673A\u6784\u964D\u4F4E\u98CE\u9669\uFF0C\u63D0\u9AD8\u653E\u8D37\u6548\u7387\u3002\u76EE\u6807\u7528\u6237\u7FA4\u4F53\u4E3A\u5E74\u8425\u4E1A\u989D\u5728100\u4E07-5000\u4E07\u4E4B\u95F4\u7684\u4E2D\u5C0F\u4F01\u4E1A\u4E3B\u3002",
        wordLimit: 300,
        lastModified: "2024-12-07 16:30:00"
      },
      {
        id: 3,
        name: "\u6837\u672C\u7EC4\u6210",
        type: "text_and_table",
        editType: "text_and_table",
        status: "completed",
        editable: true,
        textContent: "\u672C\u6B21\u5206\u6790\u4F7F\u7528\u7684\u6837\u672C\u6570\u636E\u6765\u6E90\u4E8E2024\u5E7411\u67081\u65E5\u81F311\u670830\u65E5\u671F\u95F4\u7684\u5916\u6570\u6295\u653E\u6570\u636E\uFF0C\u7ECF\u8FC7\u6570\u636E\u6E05\u6D17\u548C\u53BB\u91CD\u5904\u7406\u540E\uFF0C\u5171\u83B7\u5F97\u6709\u6548\u6837\u672C12,345\u6761\u3002\u6837\u672C\u6570\u636E\u8986\u76D6iOS\u3001Android\u3001Web\u4E09\u4E2A\u5E73\u53F0\uFF0C\u6DB5\u76D6\u591A\u4E2A\u4E3B\u8981\u6295\u653E\u6E20\u9053\uFF0C\u786E\u4FDD\u5206\u6790\u7ED3\u679C\u7684\u4EE3\u8868\u6027\u548C\u51C6\u786E\u6027\u3002",
        tableData: {
          title: "\u6837\u672C\u7EDF\u8BA1\u8868",
          headers: ["\u5E73\u53F0", "\u9001\u6D4B\u6837\u672C\u91CF", "mob3_30+\u5230\u671F\u6570", "mob3_30+\u5BA2\u6237\u6570", "mob3_30+\u5360\u6BD4", "\u9001\u6D4B\u6837\u672C\u65F6\u95F4\u8DE8\u5EA6"],
          rows: [
            ["iOS", "7,308", "6,892", "4,125", "59.8%", "2024-11-01 \u81F3 2024-11-30"],
            ["Android", "3,654", "3,421", "2,087", "61.0%", "2024-11-01 \u81F3 2024-11-30"],
            ["Web", "1,218", "1,167", "698", "59.8%", "2024-11-01 \u81F3 2024-11-30"],
            ["\u603B\u8BA1", "12,180", "11,480", "6,910", "60.2%", "2024-11-01 \u81F3 2024-11-30"]
          ]
        },
        lastModified: "2024-12-07 16:30:00"
      },
      {
        id: 4,
        name: "\u603B\u6837\u672C\u6982\u51B5",
        type: "text_and_dual_table",
        editType: "text_and_dual_table",
        status: "completed",
        editable: true,
        textContent: "\u6837\u672C\u603B\u4F53\u5206\u5E03\u5747\u5300\uFF0C\u8986\u76D6\u5404\u4E2A\u4E1A\u52A1\u573A\u666F\u548C\u7528\u6237\u7FA4\u4F53\u3002\u901A\u8FC7\u6837\u672C\u9971\u548C\u5EA6\u5206\u6790\u548C\u76F8\u5173\u6027\u68C0\u9A8C\uFF0C\u9A8C\u8BC1\u4E86\u6837\u672C\u7684\u4EE3\u8868\u6027\u548C\u5206\u6790\u7ED3\u679C\u7684\u53EF\u9760\u6027\u3002\u9971\u548C\u5EA6\u6307\u6807\u663E\u793A\u6570\u636E\u8D28\u91CF\u826F\u597D\uFF0C\u76F8\u5173\u6027\u5206\u6790\u9A8C\u8BC1\u4E86\u5404\u6307\u6807\u95F4\u7684\u5173\u8054\u6027\u3002",
        tableData: {
          saturationTable: {
            title: "\u9971\u548C\u5EA6\u5206\u6790",
            headers: ["\u7EDF\u8BA1\u6307\u6807", "\u6570\u503C"],
            rows: [
              ["\u6709\u503C\u6570", "11,480"],
              ["\u5747\u503C", "0.602"],
              ["\u6807\u51C6\u5DEE", "0.089"],
              ["\u6700\u5C0F\u503C", "0.421"],
              ["\u6700\u5927\u503C", "0.758"],
              ["\u4E2D\u4F4D\u6570", "0.598"],
              ["75%\u5206\u4F4D\u6570", "0.645"],
              ["95%\u5206\u4F4D\u6570", "0.712"]
            ]
          },
          correlationTable: {
            title: "\u76F8\u5173\u6027\u5206\u6790",
            headers: ["\u76F8\u5173\u6027\u6307\u6807", "\u7CFB\u6570\u503C"],
            rows: [
              ["\u6307\u68071", "0.73"],
              ["\u6307\u68072", "0.65"],
              ["\u6307\u68073", "0.58"]
            ]
          }
        },
        lastModified: "2024-12-07 16:30:00"
      },
      {
        id: 5,
        name: "\u6548\u679C\u5206\u6790-\u5168\u5E73\u53F0",
        type: "text_and_chart_and_table",
        editType: "text_and_chart_and_table",
        status: "completed",
        editable: true,
        textContent: "\u5168\u5E73\u53F0\u6574\u4F53\u6548\u679C\u8868\u73B0\u826F\u597D\uFF0C\u8F6C\u5316\u6F0F\u6597\u5404\u73AF\u8282\u8F6C\u5316\u7387\u5747\u8FBE\u5230\u9884\u671F\u76EE\u6807\u3002\u4ECE\u65F6\u95F4\u8D8B\u52BF\u6765\u770B\uFF0C\u6548\u679C\u6307\u6807\u5728\u5206\u6790\u5468\u671F\u5185\u4FDD\u6301\u7A33\u5B9A\uFF0C\u7A33\u5B9A\u6027\u6307\u6807\u663E\u793A\u4EA7\u54C1\u5177\u6709\u826F\u597D\u7684\u6301\u7EED\u8F6C\u5316\u80FD\u529B\u3002\u6574\u4F53ROI\u8FBE\u52302.3\uFF0C\u8D85\u51FA\u9884\u671F\u76EE\u680720%\u3002",
        chartData: {
          funnelChart: {
            title: "\u5168\u5E73\u53F0\u8F6C\u5316\u6F0F\u6597\u56FE",
            type: "image",
            imagePath: "/charts/funnel_chart_platform_all.svg",
            description: "\u5C55\u793A\u5168\u5E73\u53F0\u8F6C\u5316\u6F0F\u6597\u5404\u73AF\u8282\u6570\u636E\uFF0C\u5305\u542B\u66DD\u5149\u3001\u70B9\u51FB\u3001\u8BBF\u95EE\u3001\u6CE8\u518C\u3001\u8F6C\u5316\u4E94\u4E2A\u73AF\u8282\u7684\u8F6C\u5316\u7387"
          },
          trendChart: {
            title: "\u65F6\u95F4\u8D8B\u52BF\u56FE",
            type: "image",
            imagePath: "/charts/trend_chart_platform_all.svg",
            description: "\u5C55\u793ACTR\u3001CVR\u3001ROI\u4E09\u4E2A\u5173\u952E\u6307\u6807\u5728\u65F6\u95F4\u7EF4\u5EA6\u4E0A\u7684\u53D8\u5316\u8D8B\u52BF"
          }
        },
        tableData: {
          title: "\u6548\u679C\u5206\u6790\u6307\u6807",
          headers: ["\u6307\u6807\u540D\u79F0", "IV\u503C", "WOE\u503C", "\u4FE1\u606F\u503C"],
          rows: [
            ["\u6307\u68071", "0.342", "1.256", "0.428"],
            ["\u6307\u68072", "0.287", "0.943", "0.371"],
            ["\u6307\u68073", "0.195", "0.672", "0.289"]
          ]
        },
        lastModified: "2024-12-07 16:30:00"
      },
      {
        id: 6,
        name: "\u6548\u679C\u5206\u6790-\u5206\u5E73\u53F0",
        type: "text_and_chart_and_table",
        editType: "text_and_chart_and_table",
        status: "completed",
        editable: true,
        textContent: "\u5206\u5E73\u53F0\u6548\u679C\u5BF9\u6BD4\u663E\u793AiOS\u5E73\u53F0\u8868\u73B0\u6700\u4F73\uFF0C\u8F6C\u5316\u7387\u8FBE\u52304.8%\uFF0CAndroid\u5E73\u53F0\u6B21\u4E4B\u4E3A4.1%\uFF0CWeb\u5E73\u53F0\u76F8\u5BF9\u8F83\u4F4E\u4E3A3.2%\u3002\u5404\u5E73\u53F0\u7A33\u5B9A\u6027\u6307\u6807\u5747\u5728\u5408\u7406\u8303\u56F4\u5185\uFF0CiOS\u5E73\u53F0\u7684\u7528\u6237\u8D28\u91CF\u548C\u8F6C\u5316\u6DF1\u5EA6\u660E\u663E\u4F18\u4E8E\u5176\u4ED6\u5E73\u53F0\u3002",
        chartData: {
          platformComparison: {
            title: "\u5206\u5E73\u53F0\u6548\u679C\u5BF9\u6BD4",
            type: "image",
            imagePath: "/charts/platform_comparison_chart.svg",
            description: "\u5C55\u793AiOS\u3001Android\u3001Web\u4E09\u4E2A\u5E73\u53F0\u7684CTR\u3001CVR\u3001ROI\u5BF9\u6BD4\u6570\u636E"
          },
          stabilityRadar: {
            title: "\u5E73\u53F0\u7A33\u5B9A\u6027\u96F7\u8FBE\u56FE",
            type: "image",
            imagePath: "/charts/stability_radar_chart.svg",
            description: "\u5C55\u793A\u5404\u5E73\u53F0\u5728\u8F6C\u5316\u7A33\u5B9A\u6027\u3001\u6210\u672C\u7A33\u5B9A\u6027\u3001\u8D28\u91CF\u7A33\u5B9A\u6027\u3001\u65F6\u95F4\u7A33\u5B9A\u6027\u3001\u6E20\u9053\u7A33\u5B9A\u6027\u4E94\u4E2A\u7EF4\u5EA6\u7684\u8868\u73B0"
          }
        },
        tableData: {
          title: "\u5206\u5E73\u53F0\u6548\u679C\u5206\u6790\u6307\u6807",
          headers: ["\u5E73\u53F0", "IV\u503C", "WOE\u503C", "\u4FE1\u606F\u503C"],
          rows: [
            ["iOS", "0.398", "1.425", "0.567"],
            ["Android", "0.312", "1.089", "0.445"],
            ["Web", "0.234", "0.756", "0.298"]
          ]
        },
        lastModified: "2024-12-07 16:30:00"
      },
      {
        id: 7,
        name: "\u6570\u636E\u7ED3\u8BBA",
        type: "text",
        editType: "text_only",
        status: "completed",
        editable: true,
        content: "\u57FA\u4E8E12,345\u6761\u6837\u672C\u6570\u636E\u7684\u5206\u6790\u7ED3\u679C\uFF0C\u4EA7\u54C1A\u57282024\u5E7411\u6708\u671F\u95F4\u8868\u73B0\u4F18\u5F02\uFF0C\u6574\u4F53ROI\u8FBE\u52302.3\uFF0C\u8D85\u51FA\u9884\u671F\u76EE\u6807\u3002\u5EFA\u8BAE\uFF1A1\uFF09\u7EE7\u7EED\u52A0\u5927iOS\u5E73\u53F0\u6295\u653E\u529B\u5EA6\uFF0C\u8BE5\u5E73\u53F0\u8F6C\u5316\u6548\u679C\u6700\u4F73\uFF1B2\uFF09\u4F18\u5316Android\u5E73\u53F0\u7684\u6295\u653E\u7B56\u7565\uFF0C\u63D0\u5347\u8F6C\u5316\u6DF1\u5EA6\uFF1B3\uFF09\u91CD\u65B0\u8BC4\u4F30Web\u5E73\u53F0\u6295\u653E\u4EF7\u503C\uFF0C\u8003\u8651\u8C03\u6574\u9884\u7B97\u5206\u914D\uFF1B4\uFF09\u4FDD\u6301\u5F53\u524D\u6295\u653E\u8282\u594F\uFF0C\u6548\u679C\u6307\u6807\u7A33\u5B9A\u4E14\u6301\u7EED\u5411\u597D\u3002\u540E\u7EED\u8BA1\u5212\u572812\u6708\u4EFD\u6269\u5927\u6295\u653E\u89C4\u6A21\uFF0C\u9884\u671F\u6574\u4F53ROI\u53EF\u63D0\u5347\u81F32.5\u4EE5\u4E0A\u3002",
        wordLimit: 5e3,
        lastModified: "2024-12-07 16:30:00"
      }
    ],
    // 样本文件信息
    sampleFiles: [
      {
        id: 1,
        fileName: "product_a_sample_202411.csv",
        fileSize: "2.5MB",
        uploadTime: "2024-11-30 09:00:00",
        status: "processed",
        recordCount: 12345
      },
      {
        id: 2,
        fileName: "control_group_202411.csv",
        fileSize: "1.8MB",
        uploadTime: "2024-11-30 09:05:00",
        status: "processed",
        recordCount: 8976
      }
    ],
    // 关键指标汇总
    keyMetrics: {
      totalImpressions: 125e4,
      totalClicks: 98500,
      totalConversions: 8420,
      overallCTR: 0.0788,
      overallCVR: 0.0855,
      totalCost: 156780,
      avgCPC: 1.59,
      avgCPA: 18.62,
      roi: 2.3
    },
    // 分析流程步骤（符合需求文档的9个步骤）
    analysisSteps: [
      {
        step: 1,
        name: "\u6587\u4EF6\u6570\u636E\u89E3\u6790\u4E0E\u9A8C\u8BC1",
        status: "completed",
        startTime: "2024-12-07 16:00:00",
        endTime: "2024-12-07 16:00:08",
        duration: "8\u79D2",
        description: "\u89E3\u6790CSV\u6587\u4EF6\u5E76\u9A8C\u8BC1\u6570\u636E\u683C\u5F0F"
      },
      {
        step: 2,
        name: "\u6570\u636E\u8D28\u91CF\u68C0\u67E5\u4E0E\u6E05\u6D17",
        status: "completed",
        startTime: "2024-12-07 16:00:08",
        endTime: "2024-12-07 16:00:20",
        duration: "12\u79D2",
        description: "\u68C0\u67E5\u6570\u636E\u8D28\u91CF\u5E76\u6E05\u6D17\u5F02\u5E38\u6570\u636E"
      },
      {
        step: 3,
        name: "\u5355\u4EA7\u54C1\u5173\u952E\u6307\u6807\u8BA1\u7B97",
        status: "completed",
        startTime: "2024-12-07 16:00:20",
        endTime: "2024-12-07 16:00:35",
        duration: "15\u79D2",
        description: "\u8BA1\u7B97CTR\u3001CVR\u3001ROI\u7B49\u5173\u952E\u6307\u6807"
      },
      {
        step: 4,
        name: "\u6837\u672C\u9971\u548C\u5EA6\u5206\u6790",
        status: "completed",
        startTime: "2024-12-07 16:00:35",
        endTime: "2024-12-07 16:00:42",
        duration: "7\u79D2",
        description: "\u5206\u6790\u6837\u672C\u9971\u548C\u5EA6\u548C\u4EE3\u8868\u6027"
      },
      {
        step: 5,
        name: "\u76F8\u5173\u6027\u6307\u6807\u8BA1\u7B97",
        status: "completed",
        startTime: "2024-12-07 16:00:42",
        endTime: "2024-12-07 16:01:05",
        duration: "23\u79D2",
        description: "\u8BA1\u7B97\u5404\u7EF4\u5EA6\u76F8\u5173\u6027\u7CFB\u6570"
      },
      {
        step: 6,
        name: "\u5168\u5E73\u53F0\u6548\u679C\u5206\u6790",
        status: "completed",
        startTime: "2024-12-07 16:01:05",
        endTime: "2024-12-07 16:01:25",
        duration: "20\u79D2",
        description: "\u5206\u6790\u5168\u5E73\u53F0\u6574\u4F53\u6548\u679C\u8868\u73B0"
      },
      {
        step: 7,
        name: "\u5206\u5E73\u53F0\u6548\u679C\u5206\u6790",
        status: "completed",
        startTime: "2024-12-07 16:01:25",
        endTime: "2024-12-07 16:01:45",
        duration: "20\u79D2",
        description: "\u5BF9\u6BD4\u5206\u6790\u5404\u5E73\u53F0\u6548\u679C\u5DEE\u5F02"
      },
      {
        step: 8,
        name: "\u56FE\u8868\u81EA\u52A8\u751F\u6210",
        status: "completed",
        startTime: "2024-12-07 16:01:45",
        endTime: "2024-12-07 16:02:00",
        duration: "15\u79D2",
        description: "\u751F\u6210\u6F0F\u6597\u56FE\u3001\u8D8B\u52BF\u56FE\u7B49\u53EF\u89C6\u5316\u56FE\u8868"
      },
      {
        step: 9,
        name: "\u7ED3\u8BBA\u6A21\u677F\u586B\u5145",
        status: "completed",
        startTime: "2024-12-07 16:02:00",
        endTime: "2024-12-07 16:02:05",
        duration: "5\u79D2",
        description: "\u586B\u5145\u5206\u6790\u7ED3\u8BBA\u548C\u5EFA\u8BAE\u6A21\u677F"
      }
    ]
  };
};
var generateEvaluationReportDetail = (id) => {
  const reportId = parseInt(id);
  if (reportId === 10) {
    return generateEditableReportDetail(reportId);
  }
  const statuses = ["completed", "processing", "failed", "pending", "paused"];
  const status = statuses[reportId % statuses.length];
  const baseData = {
    id: reportId,
    reportName: `\u4EA7\u54C1${String.fromCharCode(65 + reportId % 4)}\u6548\u679C\u8BC4\u4F30\u62A5\u544A_${(/* @__PURE__ */ new Date()).toISOString().split("T")[0].replace(/-/g, "")}`,
    productName: `\u4EA7\u54C1${String.fromCharCode(65 + reportId % 4)}`,
    reportType: "\u6548\u679C\u8BC4\u4F30",
    analysisType: "\u5468\u671F\u6027\u5206\u6790",
    generateDate: (/* @__PURE__ */ new Date()).toISOString().split("T")[0],
    status,
    progress: status === "completed" ? 100 : status === "processing" ? Math.floor(Math.random() * 80) + 10 : Math.floor(Math.random() * 50),
    sampleTimeSpan: "2024-11-01 \u81F3 2024-11-30",
    templateType: "\u6807\u51C6\u6A21\u677F",
    analysisTime: status === "completed" ? `${(/* @__PURE__ */ new Date()).toISOString().split("T")[0]} 14:20:00` : null,
    failureReason: status === "failed" ? "\u6570\u636E\u6E90\u8FDE\u63A5\u5931\u8D25" : null,
    // 报告模块
    modules: [
      {
        id: 1,
        name: "\u6D4B\u8BD5\u80CC\u666F",
        status: status === "completed" ? "completed" : status === "processing" ? "processing" : "pending",
        content: status === "completed" ? "\u672C\u6B21\u6D4B\u8BD5\u9488\u5BF9\u4EA7\u54C1A\u57282024\u5E7411\u6708\u7684\u6548\u679C\u8FDB\u884C\u5168\u9762\u8BC4\u4F30..." : null
      },
      {
        id: 2,
        name: "\u4EA7\u54C1\u4ECB\u7ECD",
        status: status === "completed" ? "completed" : status === "processing" ? "processing" : "pending",
        content: status === "completed" ? "\u4EA7\u54C1A\u662F\u4E00\u6B3E\u9762\u5411\u4E2D\u5C0F\u4F01\u4E1A\u7684\u91D1\u878D\u670D\u52A1\u4EA7\u54C1..." : null
      },
      {
        id: 3,
        name: "\u6837\u672C\u7EC4\u6210",
        status: status === "completed" ? "completed" : status === "processing" ? "processing" : "pending",
        content: status === "completed" ? "\u672C\u6B21\u5206\u6790\u5171\u5305\u542B\u6837\u672C\u6570\u636E12,345\u6761..." : null
      },
      {
        id: 4,
        name: "\u603B\u6837\u672C\u6982\u51B5",
        status: status === "completed" ? "completed" : status === "processing" ? "completed" : "pending",
        content: status === "completed" ? "\u6837\u672C\u603B\u4F53\u5206\u5E03\u5747\u5300\uFF0C\u8986\u76D6\u5404\u4E2A\u4E1A\u52A1\u573A\u666F..." : null
      },
      {
        id: 5,
        name: "\u6548\u679C\u5206\u6790",
        status: status === "completed" ? "completed" : status === "processing" ? "processing" : "pending",
        content: status === "completed" ? "\u901A\u8FC7\u5BF9\u6BD4\u5206\u6790\uFF0C\u4EA7\u54C1A\u5728\u76EE\u6807\u6307\u6807\u4E0A\u8868\u73B0\u826F\u597D..." : null
      },
      {
        id: 6,
        name: "\u5206\u5E73\u53F0\u6548\u679C",
        status: status === "completed" ? "completed" : status === "processing" ? "processing" : "pending",
        content: status === "completed" ? "\u5404\u5E73\u53F0\u6548\u679C\u5DEE\u5F02\u5206\u6790\u663E\u793A..." : null
      },
      {
        id: 7,
        name: "\u603B\u7ED3\u5EFA\u8BAE",
        status: status === "completed" ? "completed" : status === "processing" ? "pending" : "pending",
        content: status === "completed" ? "\u57FA\u4E8E\u672C\u6B21\u8BC4\u4F30\u7ED3\u679C\uFF0C\u5EFA\u8BAE..." : null
      }
    ],
    // 样本文件信息
    sampleFiles: [
      {
        id: 1,
        fileName: "sample_data_202411.csv",
        fileSize: "2.5MB",
        uploadTime: "2024-11-30 09:00:00",
        status: "processed"
      },
      {
        id: 2,
        fileName: "control_group_202411.csv",
        fileSize: "1.8MB",
        uploadTime: "2024-11-30 09:05:00",
        status: "processed"
      }
    ]
  };
  if (status === "completed" || status === "processing") {
    return {
      ...baseData,
      // 分平台效果分析数据
      platformAnalysis: {
        platforms: ["\u5B57\u8282", "\u8682\u8681", "\u4EAC\u4E1C", "\u7F8E\u56E2"],
        data: [
          {
            platform: "\u5B57\u8282",
            totalSamples: 3200,
            validSamples: 3150,
            conversionRate: 0.0845,
            avgCost: 12.5,
            roi: 2.3
          },
          {
            platform: "\u8682\u8681",
            totalSamples: 2800,
            validSamples: 2750,
            conversionRate: 0.092,
            avgCost: 15.2,
            roi: 2.1
          },
          {
            platform: "\u4EAC\u4E1C",
            totalSamples: 3500,
            validSamples: 3420,
            conversionRate: 0.078,
            avgCost: 11.8,
            roi: 2.5
          },
          {
            platform: "\u7F8E\u56E2",
            totalSamples: 2900,
            validSamples: 2850,
            conversionRate: 0.0865,
            avgCost: 13.1,
            roi: 2.2
          }
        ]
      },
      // 关键指标汇总
      keyMetrics: {
        totalImpressions: 125e4,
        totalClicks: 98500,
        totalConversions: 8420,
        overallCTR: 0.0788,
        overallCVR: 0.0855,
        totalCost: 156780,
        avgCPC: 1.59,
        avgCPA: 18.62
      },
      // 时间趋势数据
      timeTrend: {
        daily: Array.from({ length: 30 }, (_, i) => ({
          date: new Date(2024, 10, i + 1).toISOString().split("T")[0],
          impressions: Math.floor(Math.random() * 5e4) + 3e4,
          clicks: Math.floor(Math.random() * 4e3) + 2e3,
          conversions: Math.floor(Math.random() * 400) + 200,
          cost: Math.floor(Math.random() * 8e3) + 4e3
        })),
        hourly: Array.from({ length: 24 }, (_, i) => ({
          hour: i,
          impressions: Math.floor(Math.random() * 5e3) + 2e3,
          clicks: Math.floor(Math.random() * 400) + 100,
          conversions: Math.floor(Math.random() * 40) + 10,
          cost: Math.floor(Math.random() * 800) + 200
        }))
      },
      // 分析流程步骤
      analysisSteps: [
        {
          step: 1,
          name: "\u6570\u636E\u9884\u5904\u7406",
          status: "completed",
          startTime: "2024-12-04 10:00:00",
          endTime: "2024-12-04 10:15:00",
          duration: "15\u5206\u949F",
          description: "\u6E05\u6D17\u548C\u6807\u51C6\u5316\u539F\u59CB\u6570\u636E"
        },
        {
          step: 2,
          name: "\u6837\u672C\u5339\u914D",
          status: "completed",
          startTime: "2024-12-04 10:15:00",
          endTime: "2024-12-04 10:45:00",
          duration: "30\u5206\u949F",
          description: "\u5339\u914D\u5B9E\u9A8C\u7EC4\u548C\u5BF9\u7167\u7EC4\u6837\u672C"
        },
        {
          step: 3,
          name: "\u7279\u5F81\u5DE5\u7A0B",
          status: "completed",
          startTime: "2024-12-04 10:45:00",
          endTime: "2024-12-04 11:30:00",
          duration: "45\u5206\u949F",
          description: "\u6784\u5EFA\u5206\u6790\u6240\u9700\u7684\u7279\u5F81\u53D8\u91CF"
        },
        {
          step: 4,
          name: "\u6548\u679C\u8BA1\u7B97",
          status: status === "completed" ? "completed" : "processing",
          startTime: "2024-12-04 11:30:00",
          endTime: status === "completed" ? "2024-12-04 12:15:00" : null,
          duration: status === "completed" ? "45\u5206\u949F" : null,
          description: "\u8BA1\u7B97\u5404\u9879\u6548\u679C\u6307\u6807"
        },
        {
          step: 5,
          name: "\u7EDF\u8BA1\u68C0\u9A8C",
          status: status === "completed" ? "completed" : "pending",
          startTime: status === "completed" ? "2024-12-04 12:15:00" : null,
          endTime: status === "completed" ? "2024-12-04 12:45:00" : null,
          duration: status === "completed" ? "30\u5206\u949F" : null,
          description: "\u8FDB\u884C\u7EDF\u8BA1\u663E\u8457\u6027\u68C0\u9A8C"
        },
        {
          step: 6,
          name: "\u5206\u5E73\u53F0\u5206\u6790",
          status: status === "completed" ? "completed" : "pending",
          startTime: status === "completed" ? "2024-12-04 12:45:00" : null,
          endTime: status === "completed" ? "2024-12-04 13:30:00" : null,
          duration: status === "completed" ? "45\u5206\u949F" : null,
          description: "\u5206\u6790\u5404\u5E73\u53F0\u7684\u6548\u679C\u5DEE\u5F02"
        },
        {
          step: 7,
          name: "\u8D8B\u52BF\u5206\u6790",
          status: status === "completed" ? "completed" : "pending",
          startTime: status === "completed" ? "2024-12-04 13:30:00" : null,
          endTime: status === "completed" ? "2024-12-04 14:00:00" : null,
          duration: status === "completed" ? "30\u5206\u949F" : null,
          description: "\u5206\u6790\u65F6\u95F4\u8D8B\u52BF\u548C\u5468\u671F\u6027\u89C4\u5F8B"
        },
        {
          step: 8,
          name: "\u62A5\u544A\u751F\u6210",
          status: status === "completed" ? "completed" : "pending",
          startTime: status === "completed" ? "2024-12-04 14:00:00" : null,
          endTime: status === "completed" ? "2024-12-04 14:15:00" : null,
          duration: status === "completed" ? "15\u5206\u949F" : null,
          description: "\u751F\u6210\u6700\u7EC8\u5206\u6790\u62A5\u544A"
        },
        {
          step: 9,
          name: "\u8D28\u91CF\u68C0\u67E5",
          status: status === "completed" ? "completed" : "pending",
          startTime: status === "completed" ? "2024-12-04 14:15:00" : null,
          endTime: status === "completed" ? "2024-12-04 14:20:00" : null,
          duration: status === "completed" ? "5\u5206\u949F" : null,
          description: "\u68C0\u67E5\u62A5\u544A\u8D28\u91CF\u548C\u5B8C\u6574\u6027"
        }
      ]
    };
  }
  return baseData;
};
var generateRegisteredProducts = () => {
  const manualProducts = [
    {
      id: "EXT001",
      name: "\u4E2A\u4EBA\u8EAB\u4EFD\u6838\u9A8C\u670D\u52A1",
      code: "PID-IDENTITY-VERIFY",
      supplier: "\u5B66\u4FE1\u7F51",
      // 修正为学信网
      provider: "\u5B66\u4FE1\u7F51",
      channelId: "CH-001",
      channelName: "\u5B66\u4FE1\u7F51",
      category: "\u6838\u9A8C\u7C7B",
      status: "online",
      interfaces: 2,
      bottomTable: "dwd_identity_verify_detail",
      unitPrice: 0.5,
      billingMode: "per_call",
      billingCycle: "month",
      currency: "CNY",
      registrationDate: "2023-12-01",
      lastUpdateDate: "2025-12-01",
      usageScene: "\u6CE8\u518C\u5B9E\u540D\u8BA4\u8BC1",
      tags: ["\u6838\u9A8C", "\u8EAB\u4EFD"],
      description: "\u63D0\u4F9B\u5B9E\u65F6\u8EAB\u4EFD\u4FE1\u606F\u6838\u9A8C\u670D\u52A1\uFF0C\u652F\u6301\u59D3\u540D\u3001\u8EAB\u4EFD\u8BC1\u53F7\u3001\u624B\u673A\u53F7\u4E09\u8981\u7D20\u6216\u4E8C\u8981\u7D20\u7684\u6838\u9A8C"
    },
    {
      id: "EXT002",
      name: "\u4F01\u4E1A\u4FE1\u7528\u8BC4\u5206\u670D\u52A1",
      code: "PID-ENTERPRISE-CREDIT",
      supplier: "\u767E\u884C",
      // 修正为百行，增加多样性
      provider: "\u767E\u884C\u5F81\u4FE1",
      channelId: "CH-002",
      channelName: "\u767E\u884C\u5F81\u4FE1",
      category: "\u8BC4\u5206\u7C7B",
      status: "online",
      interfaces: 1,
      bottomTable: "dwd_enterprise_credit_detail",
      unitPrice: 20,
      billingMode: "per_call",
      billingCycle: "month",
      currency: "CNY",
      registrationDate: "2023-11-15",
      lastUpdateDate: "2025-12-01",
      usageScene: "\u8D37\u524D\u6388\u4FE1\u8BC4\u4F30",
      tags: ["\u8BC4\u5206", "\u5F81\u4FE1"],
      description: "\u4F01\u4E1A\u591A\u7EF4\u5EA6\u4FE1\u7528\u98CE\u9669\u8BC4\u5206\u670D\u52A1\uFF0C\u9002\u7528\u4E8E\u4F01\u4E1A\u6388\u4FE1\u3001\u8D37\u524D\u5BA1\u67E5\u7B49\u573A\u666F"
    },
    {
      id: "EXT003",
      name: "\u8BBE\u5907\u6307\u7EB9\u98CE\u9669\u8BC6\u522B",
      code: "PID-DEVICE-FP",
      supplier: "\u94B1\u5858",
      // 修正为钱塘
      provider: "\u94B1\u5858\u5F81\u4FE1",
      channelId: "CH-003",
      channelName: "\u94B1\u5858\u5F81\u4FE1",
      category: "\u53CD\u6B3A\u8BC8",
      status: "importing",
      interfaces: 1,
      bottomTable: "dwd_device_fingerprint",
      unitPrice: 0.2,
      billingMode: "per_call",
      billingCycle: "month",
      currency: "CNY",
      registrationDate: "2025-11-01",
      lastUpdateDate: "2025-12-01",
      usageScene: "\u767B\u5F55\u4E0E\u4EA4\u6613\u98CE\u63A7",
      tags: ["\u8BBE\u5907", "\u98CE\u63A7"],
      description: "\u8BBE\u5907\u6307\u7EB9\u8BC6\u522B\u4E0E\u98CE\u9669\u6807\u6CE8\uFF0C\u652F\u6301\u53CD\u81EA\u52A8\u5316\u4E0E\u8D26\u53F7\u5B89\u5168\u573A\u666F"
    }
  ];
  const supplierMap = {
    "SUP-001": "\u5B66\u4FE1\u7F51",
    // 修正：SUP-001 应映射为学信网，与 ContractCreate 兜底逻辑一致
    "SUP-002": "\u817E\u8BAF",
    "SUP-003": "\u767E\u5EA6",
    "SUP-004": "\u9AD8\u5FB7"
  };
  const mappedProducts = supplierProductsMock.map((p) => ({
    id: p.productId,
    name: p.productName,
    code: p.productCode,
    supplier: supplierMap[p.supplierId] || p.supplierId,
    provider: supplierMap[p.supplierId] || p.supplierId,
    channelId: p.supplierId,
    channelName: supplierMap[p.supplierId] || p.supplierId,
    category: p.category === "SPECIAL" ? "\u7279\u6B8A" : "\u6570\u636E",
    status: "online",
    interfaces: p.interfaceCount,
    bottomTable: `dwd_${p.productCode.toLowerCase().replace(/-/g, "_")}_detail`,
    unitPrice: 1,
    billingMode: "per_call",
    billingCycle: "month",
    currency: "CNY",
    registrationDate: p.createdAt.split("T")[0],
    lastUpdateDate: p.updatedAt.split("T")[0],
    usageScene: "\u901A\u7528\u573A\u666F",
    tags: ["\u5916\u6570", p.category],
    description: `${p.productName} - \u7531${supplierMap[p.supplierId] || p.supplierId}\u63D0\u4F9B`
  }));
  return [...manualProducts, ...mappedProducts];
};
var external_data_evaluation_default = [
  // 模拟外部数据评估报告列表API
  {
    url: "/api/external-data-evaluation/list",
    method: "get",
    response: ({ query }) => {
      const {
        current = 1,
        pageSize = 10,
        reportName,
        status,
        startDate,
        endDate
      } = query;
      let reports = generateEvaluationReports(50);
      if (reportName) {
        reports = reports.filter(
          (report) => report.reportName.toLowerCase().includes(reportName.toLowerCase())
        );
      }
      if (status) {
        reports = reports.filter((report) => report.status === status);
      }
      if (startDate) {
        reports = reports.filter((report) => report.generateDate >= startDate);
      }
      if (endDate) {
        reports = reports.filter((report) => report.generateDate <= endDate);
      }
      const start = (current - 1) * pageSize;
      const end = start + pageSize;
      const paginatedReports = reports.slice(start, end);
      return {
        code: 200,
        message: "success",
        data: {
          list: paginatedReports,
          total: reports.length,
          current: parseInt(current),
          pageSize: parseInt(pageSize)
        }
      };
    }
  },
  // 模拟外部数据评估报告详情API
  {
    url: "/api/external-data-evaluation/detail/:id",
    method: "get",
    response: ({ url }) => {
      const id = url.split("/").pop();
      if (!id) {
        return {
          code: 400,
          message: "\u7F3A\u5C11\u62A5\u544AID",
          data: null
        };
      }
      const reportDetail = generateEvaluationReportDetail(id);
      return {
        code: 200,
        message: "success",
        data: reportDetail
      };
    }
  },
  // 模拟创建外部数据评估报告API
  {
    url: "/api/external-data-evaluation/create",
    method: "post",
    response: ({ body }) => {
      const { title, type, status, score, reportName, reportType, analysisType, sampleFiles } = body;
      const newReport = {
        id: Date.now(),
        title: title || reportName || `\u8BC4\u4F30-${Date.now()}`,
        type: type || reportType || "comprehensive",
        reportType: type || reportType || "comprehensive",
        status: status || "draft",
        score: score ?? 0,
        createdAt: (/* @__PURE__ */ new Date()).toISOString(),
        // 旧版字段（保持兼容性）
        reportName: title || reportName,
        analysisType: analysisType || type,
        generateDate: (/* @__PURE__ */ new Date()).toISOString().split("T")[0],
        progress: 0,
        sampleTimeSpan: "",
        templateType: "\u6807\u51C6\u6A21\u677F",
        analysisTime: null,
        failureReason: null,
        sampleFiles: sampleFiles || []
      };
      return {
        code: 200,
        message: "\u62A5\u544A\u521B\u5EFA\u6210\u529F",
        data: newReport
      };
    }
  },
  // 模拟获取已注册的外数产品列表API
  {
    url: "/api/external-data-evaluation/products",
    method: "get",
    response: () => {
      return {
        code: 200,
        message: "success",
        data: generateRegisteredProducts()
      };
    }
  },
  // 模拟更新外部数据评估报告API
  {
    url: "/api/external-data-evaluation/update/:id",
    method: "put",
    response: ({ url, body }) => {
      const id = url.split("/").pop();
      if (!id) {
        return {
          code: 400,
          message: "\u7F3A\u5C11\u62A5\u544AID",
          data: null
        };
      }
      return {
        code: 200,
        message: "\u62A5\u544A\u4FDD\u5B58\u6210\u529F",
        data: {
          id: parseInt(id),
          ...body,
          lastModified: (/* @__PURE__ */ new Date()).toISOString()
        }
      };
    }
  },
  // 模拟发布外部数据评估报告API
  {
    url: "/api/external-data-evaluation/publish/:id",
    method: "put",
    response: ({ url, body }) => {
      const id = url.split("/").pop();
      if (!id) {
        return {
          code: 400,
          message: "\u7F3A\u5C11\u62A5\u544AID",
          data: null
        };
      }
      return {
        code: 200,
        message: "\u62A5\u544A\u53D1\u5E03\u6210\u529F",
        data: {
          id: parseInt(id),
          ...body,
          status: "\u5DF2\u53D1\u5E03",
          progress: 100,
          publishTime: (/* @__PURE__ */ new Date()).toISOString()
        }
      };
    }
  },
  // 模拟归档外部数据评估报告API
  {
    url: "/api/external-data-evaluation/:id/archive",
    method: "put",
    response: ({ url }) => {
      const parts = url.split("/");
      const id = parts[parts.length - 2];
      if (!id) {
        return {
          code: 400,
          message: "\u7F3A\u5C11\u62A5\u544AID",
          data: null
        };
      }
      return {
        code: 200,
        message: "\u62A5\u544A\u5F52\u6863\u6210\u529F",
        data: {
          id: parseInt(id),
          status: "archived"
        }
      };
    }
  }
];
export {
  external_data_evaluation_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsiLi4vLi4vc3JjL21vY2svcmlzay1zY29wZS9leHRlcm5hbC1kYXRhLWV2YWx1YXRpb24udHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9faW5qZWN0ZWRfZmlsZW5hbWVfXyA9IFwiL1VzZXJzL21hYy9uaXNfbW9jay9kYXRhX2NvbXVuaXR5L2RhdGFfY29tdW5pdHkvc3JjL21vY2svcmlzay1zY29wZS9leHRlcm5hbC1kYXRhLWV2YWx1YXRpb24udHNcIjtjb25zdCBfX2luamVjdGVkX2Rpcm5hbWVfXyA9IFwiL1VzZXJzL21hYy9uaXNfbW9jay9kYXRhX2NvbXVuaXR5L2RhdGFfY29tdW5pdHkvc3JjL21vY2svcmlzay1zY29wZVwiO2NvbnN0IF9faW5qZWN0ZWRfaW1wb3J0X21ldGFfdXJsX18gPSBcImZpbGU6Ly8vVXNlcnMvbWFjL25pc19tb2NrL2RhdGFfY29tdW5pdHkvZGF0YV9jb211bml0eS9zcmMvbW9jay9yaXNrLXNjb3BlL2V4dGVybmFsLWRhdGEtZXZhbHVhdGlvbi50c1wiO2ltcG9ydCB0eXBlIHsgTW9ja01ldGhvZCB9IGZyb20gJ3ZpdGUtcGx1Z2luLW1vY2snO1xuXG4vLyBcdTUxODVcdTgwNTQgU3VwcGxpZXJQcm9kdWN0IFx1N0M3Qlx1NTc4Qlx1NUI5QVx1NEU0OVx1RkYwQ1x1OTA3Rlx1NTE0RFx1NUYxNVx1NzUyOFx1NTkxNlx1OTBFOFx1NjU4N1x1NEVGNlxuaW50ZXJmYWNlIFN1cHBsaWVyUHJvZHVjdCB7XG4gIGlkOiBzdHJpbmc7XG4gIHN1cHBsaWVySWQ6IHN0cmluZztcbiAgcHJvZHVjdElkOiBzdHJpbmc7XG4gIHByb2R1Y3RDb2RlOiBzdHJpbmc7XG4gIHByb2R1Y3ROYW1lOiBzdHJpbmc7XG4gIGNhdGVnb3J5OiBzdHJpbmc7XG4gIHN0YXR1czogc3RyaW5nO1xuICBpbnRlcmZhY2VDb3VudDogbnVtYmVyO1xuICBoYXNDb250cmFjdDogYm9vbGVhbjtcbiAgY3JlYXRlZEF0OiBzdHJpbmc7XG4gIHVwZGF0ZWRBdDogc3RyaW5nO1xufVxuXG5jb25zdCBub3cgPSBuZXcgRGF0ZSgpLnRvSVNPU3RyaW5nKCk7XG5cbi8vIFx1NTE4NVx1ODA1NCBzdXBwbGllclByb2R1Y3RzTW9jayBcdTY1NzBcdTYzNkVcbmNvbnN0IHN1cHBsaWVyUHJvZHVjdHNNb2NrOiBTdXBwbGllclByb2R1Y3RbXSA9IFtcbiAgeyBpZDogJ1NQLTAwMS1FWFRFUk5BTF9QQVJUXzEnLCBzdXBwbGllcklkOiAnU1VQLTAwMScsIHByb2R1Y3RJZDogJ1AtRVhURVJOQUxfUEFSVF8xJywgcHJvZHVjdENvZGU6ICdFWFRFUk5BTF9QQVJUXzEnLCBwcm9kdWN0TmFtZTogJ1x1NTkxNlx1NjU3MFx1NTIwNjEnLCBjYXRlZ29yeTogJ0RBVEEnLCBzdGF0dXM6ICdhY3RpdmUnLCBpbnRlcmZhY2VDb3VudDogMSwgaGFzQ29udHJhY3Q6IHRydWUsIGNyZWF0ZWRBdDogbm93LCB1cGRhdGVkQXQ6IG5vdyB9LFxuICB7IGlkOiAnU1AtMDAxLUVYVEVSTkFMX1BBUlRfMicsIHN1cHBsaWVySWQ6ICdTVVAtMDAxJywgcHJvZHVjdElkOiAnUC1FWFRFUk5BTF9QQVJUXzInLCBwcm9kdWN0Q29kZTogJ0VYVEVSTkFMX1BBUlRfMicsIHByb2R1Y3ROYW1lOiAnXHU1OTE2XHU2NTcwXHU1MjA2MicsIGNhdGVnb3J5OiAnREFUQScsIHN0YXR1czogJ2FjdGl2ZScsIGludGVyZmFjZUNvdW50OiAxLCBoYXNDb250cmFjdDogdHJ1ZSwgY3JlYXRlZEF0OiBub3csIHVwZGF0ZWRBdDogbm93IH0sXG4gIHsgaWQ6ICdTUC0wMDEtVkVSSUZZX1BBUlRfMScsIHN1cHBsaWVySWQ6ICdTVVAtMDAxJywgcHJvZHVjdElkOiAnUC1WRVJJRllfUEFSVF8xJywgcHJvZHVjdENvZGU6ICdWRVJJRllfUEFSVF8xJywgcHJvZHVjdE5hbWU6ICdcdTY4MzhcdTlBOENcdTUyMDYxJywgY2F0ZWdvcnk6ICdEQVRBJywgc3RhdHVzOiAnYWN0aXZlJywgaW50ZXJmYWNlQ291bnQ6IDEsIGhhc0NvbnRyYWN0OiB0cnVlLCBjcmVhdGVkQXQ6IG5vdywgdXBkYXRlZEF0OiBub3cgfSxcbiAgeyBpZDogJ1NQLTAwMS1WRVJJRllfUEFSVF8yJywgc3VwcGxpZXJJZDogJ1NVUC0wMDEnLCBwcm9kdWN0SWQ6ICdQLVZFUklGWV9QQVJUXzInLCBwcm9kdWN0Q29kZTogJ1ZFUklGWV9QQVJUXzInLCBwcm9kdWN0TmFtZTogJ1x1NjgzOFx1OUE4Q1x1NTIwNjInLCBjYXRlZ29yeTogJ0RBVEEnLCBzdGF0dXM6ICdhY3RpdmUnLCBpbnRlcmZhY2VDb3VudDogMSwgaGFzQ29udHJhY3Q6IHRydWUsIGNyZWF0ZWRBdDogbm93LCB1cGRhdGVkQXQ6IG5vdyB9LFxuICB7IGlkOiAnU1AtMDAxLVNQRUNJQUxfQlVORExFJywgc3VwcGxpZXJJZDogJ1NVUC0wMDEnLCBwcm9kdWN0SWQ6ICdQLVNQRUNJQUxfQlVORExFJywgcHJvZHVjdENvZGU6ICdTUEVDSUFMX0JVTkRMRScsIHByb2R1Y3ROYW1lOiAnXHU3Mjc5XHU2QjhBXHU4QkExXHU4RDM5XHU1MzA1JywgY2F0ZWdvcnk6ICdTUEVDSUFMJywgc3RhdHVzOiAnYWN0aXZlJywgaW50ZXJmYWNlQ291bnQ6IDEsIGhhc0NvbnRyYWN0OiB0cnVlLCBjcmVhdGVkQXQ6IG5vdywgdXBkYXRlZEF0OiBub3cgfSxcbiAgeyBpZDogJ1NQLTAwMS1FWFRfRklYXzAxJywgc3VwcGxpZXJJZDogJ1NVUC0wMDEnLCBwcm9kdWN0SWQ6ICdQLUVYVF9GSVhfMDEnLCBwcm9kdWN0Q29kZTogJ0VYVF9GSVhfMDEnLCBwcm9kdWN0TmFtZTogJ1x1NTkxNlx1NjU3MFx1NTIwNjAxJywgY2F0ZWdvcnk6ICdEQVRBJywgc3RhdHVzOiAnYWN0aXZlJywgaW50ZXJmYWNlQ291bnQ6IDEsIGhhc0NvbnRyYWN0OiB0cnVlLCBjcmVhdGVkQXQ6IG5vdywgdXBkYXRlZEF0OiBub3cgfSxcbiAgeyBpZDogJ1NQLTAwMS1FWFRfRklYXzAyJywgc3VwcGxpZXJJZDogJ1NVUC0wMDEnLCBwcm9kdWN0SWQ6ICdQLUVYVF9GSVhfMDInLCBwcm9kdWN0Q29kZTogJ0VYVF9GSVhfMDInLCBwcm9kdWN0TmFtZTogJ1x1NTkxNlx1NjU3MFx1NTIwNjAyJywgY2F0ZWdvcnk6ICdEQVRBJywgc3RhdHVzOiAnYWN0aXZlJywgaW50ZXJmYWNlQ291bnQ6IDEsIGhhc0NvbnRyYWN0OiB0cnVlLCBjcmVhdGVkQXQ6IG5vdywgdXBkYXRlZEF0OiBub3cgfSxcbiAgeyBpZDogJ1NQLTAwMS1FWFRfRklYXzAzJywgc3VwcGxpZXJJZDogJ1NVUC0wMDEnLCBwcm9kdWN0SWQ6ICdQLUVYVF9GSVhfMDMnLCBwcm9kdWN0Q29kZTogJ0VYVF9GSVhfMDMnLCBwcm9kdWN0TmFtZTogJ1x1NTkxNlx1NjU3MFx1NTIwNjAzJywgY2F0ZWdvcnk6ICdEQVRBJywgc3RhdHVzOiAnYWN0aXZlJywgaW50ZXJmYWNlQ291bnQ6IDEsIGhhc0NvbnRyYWN0OiB0cnVlLCBjcmVhdGVkQXQ6IG5vdywgdXBkYXRlZEF0OiBub3cgfSxcbiAgeyBpZDogJ1NQLTAwMS1FWFRfRklYXzA0Jywgc3VwcGxpZXJJZDogJ1NVUC0wMDEnLCBwcm9kdWN0SWQ6ICdQLUVYVF9GSVhfMDQnLCBwcm9kdWN0Q29kZTogJ0VYVF9GSVhfMDQnLCBwcm9kdWN0TmFtZTogJ1x1NTkxNlx1NjU3MFx1NTIwNjA0JywgY2F0ZWdvcnk6ICdEQVRBJywgc3RhdHVzOiAnYWN0aXZlJywgaW50ZXJmYWNlQ291bnQ6IDEsIGhhc0NvbnRyYWN0OiB0cnVlLCBjcmVhdGVkQXQ6IG5vdywgdXBkYXRlZEF0OiBub3cgfSxcbiAgeyBpZDogJ1NQLTAwMS1FWFRfRklYXzA1Jywgc3VwcGxpZXJJZDogJ1NVUC0wMDEnLCBwcm9kdWN0SWQ6ICdQLUVYVF9GSVhfMDUnLCBwcm9kdWN0Q29kZTogJ0VYVF9GSVhfMDUnLCBwcm9kdWN0TmFtZTogJ1x1NTkxNlx1NjU3MFx1NTIwNjA1JywgY2F0ZWdvcnk6ICdEQVRBJywgc3RhdHVzOiAnYWN0aXZlJywgaW50ZXJmYWNlQ291bnQ6IDEsIGhhc0NvbnRyYWN0OiB0cnVlLCBjcmVhdGVkQXQ6IG5vdywgdXBkYXRlZEF0OiBub3cgfSxcbiAgLy8gLi4uIFx1NEZERFx1NzU1OVx1OTBFOFx1NTIwNlx1NjgzOFx1NUZDM1x1NjU3MFx1NjM2RVx1NEVFNVx1NTFDRlx1NUMxMVx1NjU4N1x1NEVGNlx1NEY1M1x1NzlFRlx1RkYwQ1x1ODJFNVx1OTcwMFx1ODk4MVx1NTE2OFx1OTFDRlx1NTNFRlx1OEZGRFx1NTJBMFxuICB7IGlkOiAnU1AtMDAyLUVYVEVSTkFMX1BBUlRfMycsIHN1cHBsaWVySWQ6ICdTVVAtMDAyJywgcHJvZHVjdElkOiAnUC1FWFRFUk5BTF9QQVJUXzMnLCBwcm9kdWN0Q29kZTogJ0VYVEVSTkFMX1BBUlRfMycsIHByb2R1Y3ROYW1lOiAnXHU1OTE2XHU2NTcwXHU1MjA2MycsIGNhdGVnb3J5OiAnREFUQScsIHN0YXR1czogJ2FjdGl2ZScsIGludGVyZmFjZUNvdW50OiAxLCBoYXNDb250cmFjdDogdHJ1ZSwgY3JlYXRlZEF0OiBub3csIHVwZGF0ZWRBdDogbm93IH0sXG4gIHsgaWQ6ICdTUC0wMDMtTUFQX1RJTEUnLCBzdXBwbGllcklkOiAnU1VQLTAwMycsIHByb2R1Y3RJZDogJ1AtTUFQX1RJTEUnLCBwcm9kdWN0Q29kZTogJ01BUF9USUxFJywgcHJvZHVjdE5hbWU6ICdcdTU3MzBcdTU2RkVcdTc0RTZcdTcyNDcnLCBjYXRlZ29yeTogJ01BUCcsIHN0YXR1czogJ2FjdGl2ZScsIGludGVyZmFjZUNvdW50OiAxLCBoYXNDb250cmFjdDogdHJ1ZSwgY3JlYXRlZEF0OiBub3csIHVwZGF0ZWRBdDogbm93IH0sXG4gIHsgaWQ6ICdTUC0wMDQtUk9VVEVfUExBTicsIHN1cHBsaWVySWQ6ICdTVVAtMDA0JywgcHJvZHVjdElkOiAnUC1ST1VURV9QTEFOJywgcHJvZHVjdENvZGU6ICdST1VURV9QTEFOJywgcHJvZHVjdE5hbWU6ICdcdThERUZcdTdFQkZcdTg5QzRcdTUyMTInLCBjYXRlZ29yeTogJ0xCUycsIHN0YXR1czogJ2FjdGl2ZScsIGludGVyZmFjZUNvdW50OiAyLCBoYXNDb250cmFjdDogdHJ1ZSwgY3JlYXRlZEF0OiBub3csIHVwZGF0ZWRBdDogbm93IH1cbl07XG5cbi8vIFx1NzUxRlx1NjIxMFx1OEJDNFx1NEYzMFx1NjJBNVx1NTQ0QVx1NTIxN1x1ODg2OFx1NjU3MFx1NjM2RVxuY29uc3QgZ2VuZXJhdGVFdmFsdWF0aW9uUmVwb3J0cyA9IChjb3VudCA9IDIwKSA9PiB7XG4gIGNvbnN0IHN0YXR1c2VzID0gWydkcmFmdCcsICdpbl9wcm9ncmVzcycsICdjb21wbGV0ZWQnLCAnYXJjaGl2ZWQnXTtcbiAgY29uc3QgcmVwb3J0VHlwZXMgPSBbJ3F1YWxpdHknLCAncGVyZm9ybWFuY2UnLCAnY29zdF9lZmZlY3RpdmVuZXNzJywgJ2NvbXByZWhlbnNpdmUnXTtcbiAgY29uc3QgYW5hbHlzaXNUeXBlcyA9IFsnXHU1NDY4XHU2NzFGXHU2MDI3XHU1MjA2XHU2NzkwJywgJ1x1NUI5RVx1NjVGNlx1NTIwNlx1Njc5MCcsICdcdTYyNzlcdTkxQ0ZcdTUyMDZcdTY3OTAnXTtcbiAgXG4gIGNvbnN0IHJlcG9ydHMgPSBbXTtcbiAgXG4gIC8vIFx1NkRGQlx1NTJBMFx1NEUwMFx1NEU5Qlx1NTZGQVx1NUI5QVx1NzY4NFx1NzkzQVx1NEY4Qlx1NjU3MFx1NjM2RVxuICBjb25zdCBmaXhlZFJlcG9ydHMgPSBbXG4gICAge1xuICAgICAgaWQ6IDExLFxuICAgICAgdGl0bGU6ICdcdTRFQTdcdTU0QzFBXHU4RDI4XHU5MUNGXHU4QkM0XHU0RjMwXHU2MkE1XHU1NDRBXzIwMjQxMjAxJyxcbiAgICAgIHJlcG9ydE5hbWU6ICdcdTRFQTdcdTU0QzFBXHU4RDI4XHU5MUNGXHU4QkM0XHU0RjMwXHU2MkE1XHU1NDRBXzIwMjQxMjAxJyxcbiAgICAgIHR5cGU6ICdxdWFsaXR5JyxcbiAgICAgIHJlcG9ydFR5cGU6ICdxdWFsaXR5JyxcbiAgICAgIGFuYWx5c2lzVHlwZTogJ1x1NTQ2OFx1NjcxRlx1NjAyN1x1NTIwNlx1Njc5MCcsXG4gICAgICBnZW5lcmF0ZURhdGU6ICcyMDI0LTEyLTAxJyxcbiAgICAgIGNyZWF0ZWRBdDogJzIwMjQtMTItMDFUMTA6MDA6MDAuMDAwWicsXG4gICAgICBzdGF0dXM6ICdjb21wbGV0ZWQnLFxuICAgICAgc2NvcmU6IDg1LFxuICAgICAgcHJvZ3Jlc3M6IDEwMCxcbiAgICAgIHNhbXBsZVRpbWVTcGFuOiAnMjAyNC0xMS0wMSBcdTgxRjMgMjAyNC0xMS0zMCcsXG4gICAgICB0ZW1wbGF0ZVR5cGU6ICdcdTY4MDdcdTUxQzZcdTZBMjFcdTY3N0YnLFxuICAgICAgYW5hbHlzaXNUaW1lOiAnMjAyNC0xMi0wMSAxMDozMDowMCcsXG4gICAgICBmYWlsdXJlUmVhc29uOiBudWxsXG4gICAgfSxcbiAgICB7XG4gICAgICBpZDogMTAsXG4gICAgICB0aXRsZTogJ1x1NEVBN1x1NTRDMUFcdTdFRkNcdTU0MDhcdThCQzRcdTRGMzBcdTYyQTVcdTU0NEFfMjAyNDEyMDcnLFxuICAgICAgcmVwb3J0TmFtZTogJ1x1NEVBN1x1NTRDMUFcdTdFRkNcdTU0MDhcdThCQzRcdTRGMzBcdTYyQTVcdTU0NEFfMjAyNDEyMDcnLFxuICAgICAgdHlwZTogJ2NvbXByZWhlbnNpdmUnLFxuICAgICAgcmVwb3J0VHlwZTogJ2NvbXByZWhlbnNpdmUnLFxuICAgICAgYW5hbHlzaXNUeXBlOiAnXHU1NDY4XHU2NzFGXHU2MDI3XHU1MjA2XHU2NzkwJyxcbiAgICAgIGdlbmVyYXRlRGF0ZTogJzIwMjQtMTItMDcnLFxuICAgICAgY3JlYXRlZEF0OiAnMjAyNC0xMi0wN1QwOTowMDowMC4wMDBaJyxcbiAgICAgIHN0YXR1czogJ2RyYWZ0JyxcbiAgICAgIHNjb3JlOiAwLFxuICAgICAgcHJvZ3Jlc3M6IDAsXG4gICAgICBzYW1wbGVUaW1lU3BhbjogJzIwMjQtMTEtMDEgXHU4MUYzIDIwMjQtMTEtMzAnLFxuICAgICAgdGVtcGxhdGVUeXBlOiAnXHU2ODA3XHU1MUM2XHU2QTIxXHU2NzdGJyxcbiAgICAgIGFuYWx5c2lzVGltZTogbnVsbCxcbiAgICAgIGZhaWx1cmVSZWFzb246IG51bGxcbiAgICB9LFxuICAgIHtcbiAgICAgIGlkOiAxMixcbiAgICAgIHRpdGxlOiAnXHU0RUE3XHU1NEMxQlx1NjAyN1x1ODBGRFx1OEJDNFx1NEYzMFx1NjJBNVx1NTQ0QV8yMDI0MTIwMicsXG4gICAgICByZXBvcnROYW1lOiAnXHU0RUE3XHU1NEMxQlx1NjAyN1x1ODBGRFx1OEJDNFx1NEYzMFx1NjJBNVx1NTQ0QV8yMDI0MTIwMicsXG4gICAgICB0eXBlOiAncGVyZm9ybWFuY2UnLFxuICAgICAgcmVwb3J0VHlwZTogJ3BlcmZvcm1hbmNlJyxcbiAgICAgIGFuYWx5c2lzVHlwZTogJ1x1NUI5RVx1NjVGNlx1NTIwNlx1Njc5MCcsXG4gICAgICBnZW5lcmF0ZURhdGU6ICcyMDI0LTEyLTAyJyxcbiAgICAgIGNyZWF0ZWRBdDogJzIwMjQtMTItMDJUMTQ6MDA6MDAuMDAwWicsXG4gICAgICBzdGF0dXM6ICdpbl9wcm9ncmVzcycsXG4gICAgICBzY29yZTogNjAsXG4gICAgICBwcm9ncmVzczogNjUsXG4gICAgICBzYW1wbGVUaW1lU3BhbjogJzIwMjQtMTEtMTUgXHU4MUYzIDIwMjQtMTItMDInLFxuICAgICAgdGVtcGxhdGVUeXBlOiAnXHU4MUVBXHU1QjlBXHU0RTQ5XHU2QTIxXHU2NzdGJyxcbiAgICAgIGFuYWx5c2lzVGltZTogbnVsbCxcbiAgICAgIGZhaWx1cmVSZWFzb246IG51bGxcbiAgICB9LFxuICAgIHtcbiAgICAgIGlkOiAxMyxcbiAgICAgIHRpdGxlOiAnXHU0RUE3XHU1NEMxQ1x1NjAyN1x1NEVGN1x1NkJENFx1OEJDNFx1NEYzMFx1NjJBNVx1NTQ0QV8yMDI0MTIwMycsXG4gICAgICByZXBvcnROYW1lOiAnXHU0RUE3XHU1NEMxQ1x1NjAyN1x1NEVGN1x1NkJENFx1OEJDNFx1NEYzMFx1NjJBNVx1NTQ0QV8yMDI0MTIwMycsXG4gICAgICB0eXBlOiAnY29zdF9lZmZlY3RpdmVuZXNzJyxcbiAgICAgIHJlcG9ydFR5cGU6ICdjb3N0X2VmZmVjdGl2ZW5lc3MnLFxuICAgICAgYW5hbHlzaXNUeXBlOiAnXHU2Mjc5XHU5MUNGXHU1MjA2XHU2NzkwJyxcbiAgICAgIGdlbmVyYXRlRGF0ZTogJzIwMjQtMTItMDMnLFxuICAgICAgY3JlYXRlZEF0OiAnMjAyNC0xMi0wM1QxMTowMDowMC4wMDBaJyxcbiAgICAgIHN0YXR1czogJ2FyY2hpdmVkJyxcbiAgICAgIHNjb3JlOiA5MixcbiAgICAgIHByb2dyZXNzOiAxMDAsXG4gICAgICBzYW1wbGVUaW1lU3BhbjogJzIwMjQtMTAtMDEgXHU4MUYzIDIwMjQtMTEtMzAnLFxuICAgICAgdGVtcGxhdGVUeXBlOiAnXHU2ODA3XHU1MUM2XHU2QTIxXHU2NzdGJyxcbiAgICAgIGFuYWx5c2lzVGltZTogJzIwMjQtMTItMDMgMTU6NDU6MDAnLFxuICAgICAgZmFpbHVyZVJlYXNvbjogbnVsbFxuICAgIH0sXG4gICAge1xuICAgICAgaWQ6IDE0LFxuICAgICAgdGl0bGU6ICdcdTRFQTdcdTU0QzFEXHU3RUZDXHU1NDA4XHU4QkM0XHU0RjMwXHU2MkE1XHU1NDRBXzIwMjQxMjA0JyxcbiAgICAgIHJlcG9ydE5hbWU6ICdcdTRFQTdcdTU0QzFEXHU3RUZDXHU1NDA4XHU4QkM0XHU0RjMwXHU2MkE1XHU1NDRBXzIwMjQxMjA0JyxcbiAgICAgIHR5cGU6ICdjb21wcmVoZW5zaXZlJyxcbiAgICAgIHJlcG9ydFR5cGU6ICdjb21wcmVoZW5zaXZlJyxcbiAgICAgIGFuYWx5c2lzVHlwZTogJ1x1NTQ2OFx1NjcxRlx1NjAyN1x1NTIwNlx1Njc5MCcsXG4gICAgICBnZW5lcmF0ZURhdGU6ICcyMDI0LTEyLTA0JyxcbiAgICAgIGNyZWF0ZWRBdDogJzIwMjQtMTItMDRUMTY6MDA6MDAuMDAwWicsXG4gICAgICBzdGF0dXM6ICdjb21wbGV0ZWQnLFxuICAgICAgc2NvcmU6IDg4LFxuICAgICAgcHJvZ3Jlc3M6IDEwMCxcbiAgICAgIHNhbXBsZVRpbWVTcGFuOiAnMjAyNC0xMS0wMSBcdTgxRjMgMjAyNC0xMS0zMCcsXG4gICAgICB0ZW1wbGF0ZVR5cGU6ICdcdTY4MDdcdTUxQzZcdTZBMjFcdTY3N0YnLFxuICAgICAgYW5hbHlzaXNUaW1lOiAnMjAyNC0xMi0wNCAxNDoyMDowMCcsXG4gICAgICBmYWlsdXJlUmVhc29uOiBudWxsXG4gICAgfSxcbiAgICB7XG4gICAgICBpZDogMTUsXG4gICAgICB0aXRsZTogJ1x1NEVBN1x1NTRDMUFcdTVCOUVcdTY1RjZcdTYwMjdcdTgwRkRcdThCQzRcdTRGMzBfMjAyNDEyMDUnLFxuICAgICAgcmVwb3J0TmFtZTogJ1x1NEVBN1x1NTRDMUFcdTVCOUVcdTY1RjZcdTYwMjdcdTgwRkRcdThCQzRcdTRGMzBfMjAyNDEyMDUnLFxuICAgICAgdHlwZTogJ3BlcmZvcm1hbmNlJyxcbiAgICAgIHJlcG9ydFR5cGU6ICdwZXJmb3JtYW5jZScsXG4gICAgICBhbmFseXNpc1R5cGU6ICdcdTVCOUVcdTY1RjZcdTUyMDZcdTY3OTAnLFxuICAgICAgZ2VuZXJhdGVEYXRlOiAnMjAyNC0xMi0wNScsXG4gICAgICBjcmVhdGVkQXQ6ICcyMDI0LTEyLTA1VDA4OjMwOjAwLjAwMFonLFxuICAgICAgc3RhdHVzOiAnZHJhZnQnLFxuICAgICAgc2NvcmU6IDAsXG4gICAgICBwcm9ncmVzczogMCxcbiAgICAgIHNhbXBsZVRpbWVTcGFuOiAnMjAyNC0xMi0wMSBcdTgxRjMgMjAyNC0xMi0wNScsXG4gICAgICB0ZW1wbGF0ZVR5cGU6ICdcdTgxRUFcdTVCOUFcdTRFNDlcdTZBMjFcdTY3N0YnLFxuICAgICAgYW5hbHlzaXNUaW1lOiBudWxsLFxuICAgICAgZmFpbHVyZVJlYXNvbjogbnVsbFxuICAgIH1cbiAgXTtcbiAgXG4gIHJlcG9ydHMucHVzaCguLi5maXhlZFJlcG9ydHMpO1xuICBcbiAgLy8gXHU3NTFGXHU2MjEwXHU5NjhGXHU2NzNBXHU2NTcwXHU2MzZFXG4gIGZvciAobGV0IGkgPSByZXBvcnRzLmxlbmd0aDsgaSA8IGNvdW50OyBpKyspIHtcbiAgICBjb25zdCBzdGF0dXMgPSBzdGF0dXNlc1tNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiBzdGF0dXNlcy5sZW5ndGgpXTtcbiAgICBjb25zdCB0eXBlID0gcmVwb3J0VHlwZXNbTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogcmVwb3J0VHlwZXMubGVuZ3RoKV07XG4gICAgY29uc3QgYW5hbHlzaXNUeXBlID0gYW5hbHlzaXNUeXBlc1tNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiBhbmFseXNpc1R5cGVzLmxlbmd0aCldO1xuICAgIFxuICAgIGNvbnN0IGRhdGUgPSBuZXcgRGF0ZSgpO1xuICAgIGRhdGUuc2V0RGF0ZShkYXRlLmdldERhdGUoKSAtIE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIDMwKSk7XG4gICAgY29uc3QgZGF0ZVN0ciA9IGRhdGUudG9JU09TdHJpbmcoKS5zcGxpdCgnVCcpWzBdO1xuICAgIGNvbnN0IGNyZWF0ZWRBdCA9IGRhdGUudG9JU09TdHJpbmcoKTtcbiAgICBcbiAgICBsZXQgcHJvZ3Jlc3MgPSAwO1xuICAgIGxldCBzY29yZSA9IDA7XG4gICAgXG4gICAgaWYgKHN0YXR1cyA9PT0gJ2NvbXBsZXRlZCcgfHwgc3RhdHVzID09PSAnYXJjaGl2ZWQnKSB7XG4gICAgICBwcm9ncmVzcyA9IDEwMDtcbiAgICAgIHNjb3JlID0gTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogNDApICsgNjA7IC8vIDYwLTEwMFxuICAgIH0gZWxzZSBpZiAoc3RhdHVzID09PSAnaW5fcHJvZ3Jlc3MnKSB7XG4gICAgICBwcm9ncmVzcyA9IE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIDkwKSArIDEwO1xuICAgICAgc2NvcmUgPSAwO1xuICAgIH1cbiAgICBcbiAgICByZXBvcnRzLnB1c2goe1xuICAgICAgaWQ6IGkgKyAxLFxuICAgICAgdGl0bGU6IGAke3R5cGUgPT09ICdxdWFsaXR5JyA/ICdcdThEMjhcdTkxQ0YnIDogdHlwZSA9PT0gJ3BlcmZvcm1hbmNlJyA/ICdcdTYwMjdcdTgwRkQnIDogdHlwZSA9PT0gJ2Nvc3RfZWZmZWN0aXZlbmVzcycgPyAnXHU2MDI3XHU0RUY3XHU2QkQ0JyA6ICdcdTdFRkNcdTU0MDgnfVx1OEJDNFx1NEYzMFx1NjJBNVx1NTQ0QV8ke2RhdGVTdHIucmVwbGFjZSgvLS9nLCAnJyl9XyR7aX1gLFxuICAgICAgcmVwb3J0TmFtZTogYCR7dHlwZX1cdThCQzRcdTRGMzBcdTYyQTVcdTU0NEFfJHtkYXRlU3RyLnJlcGxhY2UoLy0vZywgJycpfWAsXG4gICAgICB0eXBlLFxuICAgICAgcmVwb3J0VHlwZTogdHlwZSxcbiAgICAgIGFuYWx5c2lzVHlwZSxcbiAgICAgIGdlbmVyYXRlRGF0ZTogZGF0ZVN0cixcbiAgICAgIGNyZWF0ZWRBdCxcbiAgICAgIHN0YXR1cyxcbiAgICAgIHNjb3JlLFxuICAgICAgcHJvZ3Jlc3MsXG4gICAgICBzYW1wbGVUaW1lU3BhbjogYCR7ZGF0ZVN0cn0gXHU4MUYzICR7bmV3IERhdGUoKS50b0lTT1N0cmluZygpLnNwbGl0KCdUJylbMF19YCxcbiAgICAgIHRlbXBsYXRlVHlwZTogTWF0aC5yYW5kb20oKSA+IDAuNSA/ICdcdTY4MDdcdTUxQzZcdTZBMjFcdTY3N0YnIDogJ1x1ODFFQVx1NUI5QVx1NEU0OVx1NkEyMVx1Njc3RicsXG4gICAgICBhbmFseXNpc1RpbWU6IChzdGF0dXMgPT09ICdjb21wbGV0ZWQnIHx8IHN0YXR1cyA9PT0gJ2FyY2hpdmVkJykgPyBgJHtkYXRlU3RyfSAke01hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIDI0KS50b1N0cmluZygpLnBhZFN0YXJ0KDIsICcwJyl9OiR7TWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogNjApLnRvU3RyaW5nKCkucGFkU3RhcnQoMiwgJzAnKX06MDBgIDogbnVsbCxcbiAgICAgIGZhaWx1cmVSZWFzb246IG51bGxcbiAgICB9KTtcbiAgfVxuICBcbiAgcmV0dXJuIHJlcG9ydHM7XG59O1xuXG4vLyBcdTc1MUZcdTYyMTBcdTUzRUZcdTdGMTZcdThGOTFcdTcyQjZcdTYwMDFcdTc2ODRcdTVCOENcdTY1NzRcdTYyQTVcdTU0NEFcdThCRTZcdTYwQzVcdUZGMDhcdTdCMjZcdTU0MDhcdTk3MDBcdTZDNDJcdTY1ODdcdTY4NjNcdTc2ODQ3XHU0RTJBXHU2QTIxXHU1NzU3XHU3RUQzXHU2Nzg0XHVGRjA5XG5jb25zdCBnZW5lcmF0ZUVkaXRhYmxlUmVwb3J0RGV0YWlsID0gKHJlcG9ydElkOiBudW1iZXIpID0+IHtcbiAgcmV0dXJuIHtcbiAgICBpZDogcmVwb3J0SWQsXG4gICAgcmVwb3J0TmFtZTogJ1x1NEVBN1x1NTRDMUFcdTVCOENcdTY1NzRcdTY1NDhcdTY3OUNcdThCQzRcdTRGMzBcdTYyQTVcdTU0NEFfMjAyNDEyMDcnLFxuICAgIHByb2R1Y3ROYW1lOiAnXHU0RUE3XHU1NEMxQScsXG4gICAgcmVwb3J0VHlwZTogJ1x1NEVBN1x1NTRDMVx1N0VBN1x1NjU0OFx1Njc5Q1x1OEJDNFx1NEYzMCcsXG4gICAgYW5hbHlzaXNUeXBlOiAnXHU1NDY4XHU2NzFGXHU2MDI3XHU1MjA2XHU2NzkwJyxcbiAgICBnZW5lcmF0ZURhdGU6ICcyMDI0LTEyLTA3JyxcbiAgICBzdGF0dXM6ICdcdTgzNDlcdTdBM0YnLFxuICAgIHByb2dyZXNzOiAxMDAsXG4gICAgc2FtcGxlVGltZVNwYW46ICcyMDI0LTExLTAxIFx1ODFGMyAyMDI0LTExLTMwJyxcbiAgICB0ZW1wbGF0ZVR5cGU6ICdcdTU5MTZcdTY1NzBcdThCQzRcdTRGMzAtXHU0RUE3XHU1NEMxXHU3RUE3XHU1MjA2XHU2NzkwXHU2MkE1XHU1NDRBXHU2QTIxXHU2NzdGJyxcbiAgICB0ZW1wbGF0ZUlkOiAndGVtcGxhdGVfZXh0ZXJuYWxfcHJvZHVjdF9tdnAnLFxuICAgIGFuYWx5c2lzVGltZTogJzIwMjQtMTItMDcgMTY6MzA6MDAnLFxuICAgIGZhaWx1cmVSZWFzb246IG51bGwsXG4gICAgXG4gICAgLy8gXHU2MkE1XHU1NDRBXHU3RUE3XHU1MjJCXHU3Njg0XHU3RjE2XHU4RjkxXHU2NzQzXHU5NjUwXG4gICAgZWRpdGFibGU6IHRydWUsXG4gICAgXG4gICAgLy8gXHU0RUE3XHU1NEMxXHU2Q0U4XHU1MThDXHU3MkI2XHU2MDAxXG4gICAgcHJvZHVjdFJlZ2lzdHJhdGlvblN0YXR1czogJ3JlZ2lzdGVyZWQnLFxuICAgIFxuICAgIC8vIFx1NjJBNVx1NTQ0QVx1NzY4NDdcdTRFMkFcdTU2RkFcdTVCOUFcdTZBMjFcdTU3NTdcdUZGMDhcdTdCMjZcdTU0MDhcdTk3MDBcdTZDNDJcdTY1ODdcdTY4NjNcdUZGMDlcbiAgICBtb2R1bGVzOiBbXG4gICAgICB7XG4gICAgICAgIGlkOiAxLFxuICAgICAgICBuYW1lOiAnXHU2RDRCXHU4QkQ1XHU4MENDXHU2NjZGXHU1M0NBXHU3NkVFXHU3Njg0JyxcbiAgICAgICAgdHlwZTogJ3RleHQnLFxuICAgICAgICBlZGl0VHlwZTogJ3RleHRfb25seScsXG4gICAgICAgIHN0YXR1czogJ2NvbXBsZXRlZCcsXG4gICAgICAgIGVkaXRhYmxlOiB0cnVlLFxuICAgICAgICBjb250ZW50OiAnXHU2NzJDXHU2QjIxXHU2RDRCXHU4QkQ1XHU2NUU4XHU1NzI4XHU4QkM0XHU0RjMwXHU0RUE3XHU1NEMxQVx1NTcyOFx1NTkxNlx1OTBFOFx1NjU3MFx1NjM2RVx1NjI5NVx1NjUzRVx1NEUyRFx1NzY4NFx1NjU0OFx1Njc5Q1x1ODg2OFx1NzNCMFx1MzAwMlx1OTAxQVx1OEZDN1x1NUJGOTIwMjRcdTVFNzQxMVx1NjcwOFx1NjcxRlx1OTVGNFx1NzY4NFx1NjI5NVx1NjUzRVx1NjU3MFx1NjM2RVx1OEZEQlx1ODg0Q1x1NTE2OFx1OTc2Mlx1NTIwNlx1Njc5MFx1RkYwQ1x1OEJDNFx1NEYzMFx1NEVBN1x1NTRDMVx1NTcyOFx1NEUwRFx1NTQwQ1x1NUU3M1x1NTNGMFx1NzY4NFx1OEY2Q1x1NTMxNlx1NjU0OFx1Njc5Q1x1MzAwMVx1NzUyOFx1NjIzN1x1OEQyOFx1OTFDRlx1NTQ4Q1JPSVx1ODg2OFx1NzNCMFx1RkYwQ1x1NEUzQVx1NTQwRVx1N0VFRFx1NjI5NVx1NjUzRVx1N0I1Nlx1NzU2NVx1NEYxOFx1NTMxNlx1NjNEMFx1NEY5Qlx1NjU3MFx1NjM2RVx1NjUyRlx1NjQ5MVx1MzAwMlx1NkQ0Qlx1OEJENVx1OTFDRFx1NzBCOVx1NTE3M1x1NkNFOFx1NEVBN1x1NTRDMVx1NzY4NFx1NjgzOFx1NUZDM1x1OEY2Q1x1NTMxNlx1NjMwN1x1NjgwN1x1RkYwQ1x1NTMwNVx1NjJFQ1x1NzBCOVx1NTFGQlx1NzM4N1x1MzAwMVx1OEY2Q1x1NTMxNlx1NzM4N1x1MzAwMVx1ODNCN1x1NUJBMlx1NjIxMFx1NjcyQ1x1N0I0OVx1NTE3M1x1OTUyRVx1NjMwN1x1NjgwN1x1NzY4NFx1ODg2OFx1NzNCMFx1NjBDNVx1NTFCNVx1MzAwMicsXG4gICAgICAgIHdvcmRMaW1pdDogNTAwLFxuICAgICAgICBsYXN0TW9kaWZpZWQ6ICcyMDI0LTEyLTA3IDE2OjMwOjAwJ1xuICAgICAgfSxcbiAgICAgIHtcbiAgICAgICAgaWQ6IDIsXG4gICAgICAgIG5hbWU6ICdcdTRFQTdcdTU0QzFcdTRFQ0JcdTdFQ0QnLFxuICAgICAgICB0eXBlOiAndGV4dCcsXG4gICAgICAgIGVkaXRUeXBlOiAndGV4dF9vbmx5JyxcbiAgICAgICAgc3RhdHVzOiAnY29tcGxldGVkJyxcbiAgICAgICAgZWRpdGFibGU6IHRydWUsXG4gICAgICAgIGNvbnRlbnQ6ICdcdTRFQTdcdTU0QzFBXHU2NjJGXHU0RTAwXHU2QjNFXHU5NzYyXHU1NDExXHU0RTJEXHU1QzBGXHU0RjAxXHU0RTFBXHU3Njg0XHU5MUQxXHU4NzhEXHU2NzBEXHU1MkExXHU0RUE3XHU1NEMxXHVGRjBDXHU0RTNCXHU4OTgxXHU1MjlGXHU4MEZEXHU1MzA1XHU2MkVDXHU0RkUxXHU3NTI4XHU4QkM0XHU0RjMwXHUzMDAxXHU5OENFXHU5NjY5XHU2M0E3XHU1MjM2XHU1NDhDXHU4RDQ0XHU5MUQxXHU1MzM5XHU5MTREXHUzMDAyXHU0RUE3XHU1NEMxXHU5MDFBXHU4RkM3XHU1OTI3XHU2NTcwXHU2MzZFXHU1MjA2XHU2NzkwXHU1NDhDXHU2NzNBXHU1NjY4XHU1QjY2XHU0RTYwXHU3Qjk3XHU2Q0Q1XHVGRjBDXHU0RTNBXHU0RTJEXHU1QzBGXHU0RjAxXHU0RTFBXHU2M0QwXHU0RjlCXHU1RkVCXHU5MDFGXHUzMDAxXHU1MUM2XHU3ODZFXHU3Njg0XHU0RkUxXHU3NTI4XHU4QkM0XHU0RjMwXHU2NzBEXHU1MkExXHVGRjBDXHU1RTJFXHU1MkE5XHU5MUQxXHU4NzhEXHU2NzNBXHU2Nzg0XHU5NjREXHU0RjRFXHU5OENFXHU5NjY5XHVGRjBDXHU2M0QwXHU5QUQ4XHU2NTNFXHU4RDM3XHU2NTQ4XHU3Mzg3XHUzMDAyXHU3NkVFXHU2ODA3XHU3NTI4XHU2MjM3XHU3RkE0XHU0RjUzXHU0RTNBXHU1RTc0XHU4NDI1XHU0RTFBXHU5ODlEXHU1NzI4MTAwXHU0RTA3LTUwMDBcdTRFMDdcdTRFNEJcdTk1RjRcdTc2ODRcdTRFMkRcdTVDMEZcdTRGMDFcdTRFMUFcdTRFM0JcdTMwMDInLFxuICAgICAgICB3b3JkTGltaXQ6IDMwMCxcbiAgICAgICAgbGFzdE1vZGlmaWVkOiAnMjAyNC0xMi0wNyAxNjozMDowMCdcbiAgICAgIH0sXG4gICAgICB7XG4gICAgICAgIGlkOiAzLFxuICAgICAgICBuYW1lOiAnXHU2ODM3XHU2NzJDXHU3RUM0XHU2MjEwJyxcbiAgICAgICAgdHlwZTogJ3RleHRfYW5kX3RhYmxlJyxcbiAgICAgICAgZWRpdFR5cGU6ICd0ZXh0X2FuZF90YWJsZScsXG4gICAgICAgIHN0YXR1czogJ2NvbXBsZXRlZCcsXG4gICAgICAgIGVkaXRhYmxlOiB0cnVlLFxuICAgICAgICB0ZXh0Q29udGVudDogJ1x1NjcyQ1x1NkIyMVx1NTIwNlx1Njc5MFx1NEY3Rlx1NzUyOFx1NzY4NFx1NjgzN1x1NjcyQ1x1NjU3MFx1NjM2RVx1Njc2NVx1NkU5MFx1NEU4RTIwMjRcdTVFNzQxMVx1NjcwODFcdTY1RTVcdTgxRjMxMVx1NjcwODMwXHU2NUU1XHU2NzFGXHU5NUY0XHU3Njg0XHU1OTE2XHU2NTcwXHU2Mjk1XHU2NTNFXHU2NTcwXHU2MzZFXHVGRjBDXHU3RUNGXHU4RkM3XHU2NTcwXHU2MzZFXHU2RTA1XHU2RDE3XHU1NDhDXHU1M0JCXHU5MUNEXHU1OTA0XHU3NDA2XHU1NDBFXHVGRjBDXHU1MTcxXHU4M0I3XHU1Rjk3XHU2NzA5XHU2NTQ4XHU2ODM3XHU2NzJDMTIsMzQ1XHU2NzYxXHUzMDAyXHU2ODM3XHU2NzJDXHU2NTcwXHU2MzZFXHU4OTg2XHU3NkQ2aU9TXHUzMDAxQW5kcm9pZFx1MzAwMVdlYlx1NEUwOVx1NEUyQVx1NUU3M1x1NTNGMFx1RkYwQ1x1NkRCNVx1NzZENlx1NTkxQVx1NEUyQVx1NEUzQlx1ODk4MVx1NjI5NVx1NjUzRVx1NkUyMFx1OTA1M1x1RkYwQ1x1Nzg2RVx1NEZERFx1NTIwNlx1Njc5MFx1N0VEM1x1Njc5Q1x1NzY4NFx1NEVFM1x1ODg2OFx1NjAyN1x1NTQ4Q1x1NTFDNlx1Nzg2RVx1NjAyN1x1MzAwMicsXG4gICAgICAgIHRhYmxlRGF0YToge1xuICAgICAgICAgIHRpdGxlOiAnXHU2ODM3XHU2NzJDXHU3RURGXHU4QkExXHU4ODY4JyxcbiAgICAgICAgICBoZWFkZXJzOiBbJ1x1NUU3M1x1NTNGMCcsICdcdTkwMDFcdTZENEJcdTY4MzdcdTY3MkNcdTkxQ0YnLCAnbW9iM18zMCtcdTUyMzBcdTY3MUZcdTY1NzAnLCAnbW9iM18zMCtcdTVCQTJcdTYyMzdcdTY1NzAnLCAnbW9iM18zMCtcdTUzNjBcdTZCRDQnLCAnXHU5MDAxXHU2RDRCXHU2ODM3XHU2NzJDXHU2NUY2XHU5NUY0XHU4REU4XHU1RUE2J10sXG4gICAgICAgICAgcm93czogW1xuICAgICAgICAgICAgWydpT1MnLCAnNywzMDgnLCAnNiw4OTInLCAnNCwxMjUnLCAnNTkuOCUnLCAnMjAyNC0xMS0wMSBcdTgxRjMgMjAyNC0xMS0zMCddLFxuICAgICAgICAgICAgWydBbmRyb2lkJywgJzMsNjU0JywgJzMsNDIxJywgJzIsMDg3JywgJzYxLjAlJywgJzIwMjQtMTEtMDEgXHU4MUYzIDIwMjQtMTEtMzAnXSxcbiAgICAgICAgICAgIFsnV2ViJywgJzEsMjE4JywgJzEsMTY3JywgJzY5OCcsICc1OS44JScsICcyMDI0LTExLTAxIFx1ODFGMyAyMDI0LTExLTMwJ10sXG4gICAgICAgICAgICBbJ1x1NjAzQlx1OEJBMScsICcxMiwxODAnLCAnMTEsNDgwJywgJzYsOTEwJywgJzYwLjIlJywgJzIwMjQtMTEtMDEgXHU4MUYzIDIwMjQtMTEtMzAnXVxuICAgICAgICAgIF1cbiAgICAgICAgfSxcbiAgICAgICAgbGFzdE1vZGlmaWVkOiAnMjAyNC0xMi0wNyAxNjozMDowMCdcbiAgICAgIH0sXG4gICAgICB7XG4gICAgICAgIGlkOiA0LFxuICAgICAgICBuYW1lOiAnXHU2MDNCXHU2ODM3XHU2NzJDXHU2OTgyXHU1MUI1JyxcbiAgICAgICAgdHlwZTogJ3RleHRfYW5kX2R1YWxfdGFibGUnLFxuICAgICAgICBlZGl0VHlwZTogJ3RleHRfYW5kX2R1YWxfdGFibGUnLFxuICAgICAgICBzdGF0dXM6ICdjb21wbGV0ZWQnLFxuICAgICAgICBlZGl0YWJsZTogdHJ1ZSxcbiAgICAgICAgdGV4dENvbnRlbnQ6ICdcdTY4MzdcdTY3MkNcdTYwM0JcdTRGNTNcdTUyMDZcdTVFMDNcdTU3NDdcdTUzMDBcdUZGMENcdTg5ODZcdTc2RDZcdTU0MDRcdTRFMkFcdTRFMUFcdTUyQTFcdTU3M0FcdTY2NkZcdTU0OENcdTc1MjhcdTYyMzdcdTdGQTRcdTRGNTNcdTMwMDJcdTkwMUFcdThGQzdcdTY4MzdcdTY3MkNcdTk5NzFcdTU0OENcdTVFQTZcdTUyMDZcdTY3OTBcdTU0OENcdTc2RjhcdTUxNzNcdTYwMjdcdTY4QzBcdTlBOENcdUZGMENcdTlBOENcdThCQzFcdTRFODZcdTY4MzdcdTY3MkNcdTc2ODRcdTRFRTNcdTg4NjhcdTYwMjdcdTU0OENcdTUyMDZcdTY3OTBcdTdFRDNcdTY3OUNcdTc2ODRcdTUzRUZcdTk3NjBcdTYwMjdcdTMwMDJcdTk5NzFcdTU0OENcdTVFQTZcdTYzMDdcdTY4MDdcdTY2M0VcdTc5M0FcdTY1NzBcdTYzNkVcdThEMjhcdTkxQ0ZcdTgyNkZcdTU5N0RcdUZGMENcdTc2RjhcdTUxNzNcdTYwMjdcdTUyMDZcdTY3OTBcdTlBOENcdThCQzFcdTRFODZcdTU0MDRcdTYzMDdcdTY4MDdcdTk1RjRcdTc2ODRcdTUxNzNcdTgwNTRcdTYwMjdcdTMwMDInLFxuICAgICAgICB0YWJsZURhdGE6IHtcbiAgICAgICAgICBzYXR1cmF0aW9uVGFibGU6IHtcbiAgICAgICAgICAgIHRpdGxlOiAnXHU5OTcxXHU1NDhDXHU1RUE2XHU1MjA2XHU2NzkwJyxcbiAgICAgICAgICAgIGhlYWRlcnM6IFsnXHU3RURGXHU4QkExXHU2MzA3XHU2ODA3JywgJ1x1NjU3MFx1NTAzQyddLFxuICAgICAgICAgICAgcm93czogW1xuICAgICAgICAgICAgICBbJ1x1NjcwOVx1NTAzQ1x1NjU3MCcsICcxMSw0ODAnXSxcbiAgICAgICAgICAgICAgWydcdTU3NDdcdTUwM0MnLCAnMC42MDInXSxcbiAgICAgICAgICAgICAgWydcdTY4MDdcdTUxQzZcdTVERUUnLCAnMC4wODknXSxcbiAgICAgICAgICAgICAgWydcdTY3MDBcdTVDMEZcdTUwM0MnLCAnMC40MjEnXSxcbiAgICAgICAgICAgICAgWydcdTY3MDBcdTU5MjdcdTUwM0MnLCAnMC43NTgnXSxcbiAgICAgICAgICAgICAgWydcdTRFMkRcdTRGNERcdTY1NzAnLCAnMC41OTgnXSxcbiAgICAgICAgICAgICAgWyc3NSVcdTUyMDZcdTRGNERcdTY1NzAnLCAnMC42NDUnXSxcbiAgICAgICAgICAgICAgWyc5NSVcdTUyMDZcdTRGNERcdTY1NzAnLCAnMC43MTInXVxuICAgICAgICAgICAgXVxuICAgICAgICAgIH0sXG4gICAgICAgICAgY29ycmVsYXRpb25UYWJsZToge1xuICAgICAgICAgICAgdGl0bGU6ICdcdTc2RjhcdTUxNzNcdTYwMjdcdTUyMDZcdTY3OTAnLFxuICAgICAgICAgICAgaGVhZGVyczogWydcdTc2RjhcdTUxNzNcdTYwMjdcdTYzMDdcdTY4MDcnLCAnXHU3Q0ZCXHU2NTcwXHU1MDNDJ10sXG4gICAgICAgICAgICByb3dzOiBbXG4gICAgICAgICAgICAgIFsnXHU2MzA3XHU2ODA3MScsICcwLjczJ10sXG4gICAgICAgICAgICAgIFsnXHU2MzA3XHU2ODA3MicsICcwLjY1J10sXG4gICAgICAgICAgICAgIFsnXHU2MzA3XHU2ODA3MycsICcwLjU4J11cbiAgICAgICAgICAgIF1cbiAgICAgICAgICB9XG4gICAgICAgIH0sXG4gICAgICAgIGxhc3RNb2RpZmllZDogJzIwMjQtMTItMDcgMTY6MzA6MDAnXG4gICAgICB9LFxuICAgICAge1xuICAgICAgICBpZDogNSxcbiAgICAgICAgbmFtZTogJ1x1NjU0OFx1Njc5Q1x1NTIwNlx1Njc5MC1cdTUxNjhcdTVFNzNcdTUzRjAnLFxuICAgICAgICB0eXBlOiAndGV4dF9hbmRfY2hhcnRfYW5kX3RhYmxlJyxcbiAgICAgICAgZWRpdFR5cGU6ICd0ZXh0X2FuZF9jaGFydF9hbmRfdGFibGUnLFxuICAgICAgICBzdGF0dXM6ICdjb21wbGV0ZWQnLFxuICAgICAgICBlZGl0YWJsZTogdHJ1ZSxcbiAgICAgICAgdGV4dENvbnRlbnQ6ICdcdTUxNjhcdTVFNzNcdTUzRjBcdTY1NzRcdTRGNTNcdTY1NDhcdTY3OUNcdTg4NjhcdTczQjBcdTgyNkZcdTU5N0RcdUZGMENcdThGNkNcdTUzMTZcdTZGMEZcdTY1OTdcdTU0MDRcdTczQUZcdTgyODJcdThGNkNcdTUzMTZcdTczODdcdTU3NDdcdThGQkVcdTUyMzBcdTk4ODRcdTY3MUZcdTc2RUVcdTY4MDdcdTMwMDJcdTRFQ0VcdTY1RjZcdTk1RjRcdThEOEJcdTUyQkZcdTY3NjVcdTc3MEJcdUZGMENcdTY1NDhcdTY3OUNcdTYzMDdcdTY4MDdcdTU3MjhcdTUyMDZcdTY3OTBcdTU0NjhcdTY3MUZcdTUxODVcdTRGRERcdTYzMDFcdTdBMzNcdTVCOUFcdUZGMENcdTdBMzNcdTVCOUFcdTYwMjdcdTYzMDdcdTY4MDdcdTY2M0VcdTc5M0FcdTRFQTdcdTU0QzFcdTUxNzdcdTY3MDlcdTgyNkZcdTU5N0RcdTc2ODRcdTYzMDFcdTdFRURcdThGNkNcdTUzMTZcdTgwRkRcdTUyOUJcdTMwMDJcdTY1NzRcdTRGNTNST0lcdThGQkVcdTUyMzAyLjNcdUZGMENcdThEODVcdTUxRkFcdTk4ODRcdTY3MUZcdTc2RUVcdTY4MDcyMCVcdTMwMDInLFxuICAgICAgICBjaGFydERhdGE6IHtcbiAgICAgICAgICBmdW5uZWxDaGFydDoge1xuICAgICAgICAgICAgdGl0bGU6ICdcdTUxNjhcdTVFNzNcdTUzRjBcdThGNkNcdTUzMTZcdTZGMEZcdTY1OTdcdTU2RkUnLFxuICAgICAgICAgICAgdHlwZTogJ2ltYWdlJyxcbiAgICAgICAgICAgIGltYWdlUGF0aDogJy9jaGFydHMvZnVubmVsX2NoYXJ0X3BsYXRmb3JtX2FsbC5zdmcnLFxuICAgICAgICAgICAgZGVzY3JpcHRpb246ICdcdTVDNTVcdTc5M0FcdTUxNjhcdTVFNzNcdTUzRjBcdThGNkNcdTUzMTZcdTZGMEZcdTY1OTdcdTU0MDRcdTczQUZcdTgyODJcdTY1NzBcdTYzNkVcdUZGMENcdTUzMDVcdTU0MkJcdTY2RERcdTUxNDlcdTMwMDFcdTcwQjlcdTUxRkJcdTMwMDFcdThCQkZcdTk1RUVcdTMwMDFcdTZDRThcdTUxOENcdTMwMDFcdThGNkNcdTUzMTZcdTRFOTRcdTRFMkFcdTczQUZcdTgyODJcdTc2ODRcdThGNkNcdTUzMTZcdTczODcnXG4gICAgICAgICAgfSxcbiAgICAgICAgICB0cmVuZENoYXJ0OiB7XG4gICAgICAgICAgICB0aXRsZTogJ1x1NjVGNlx1OTVGNFx1OEQ4Qlx1NTJCRlx1NTZGRScsXG4gICAgICAgICAgICB0eXBlOiAnaW1hZ2UnLFxuICAgICAgICAgICAgaW1hZ2VQYXRoOiAnL2NoYXJ0cy90cmVuZF9jaGFydF9wbGF0Zm9ybV9hbGwuc3ZnJyxcbiAgICAgICAgICAgIGRlc2NyaXB0aW9uOiAnXHU1QzU1XHU3OTNBQ1RSXHUzMDAxQ1ZSXHUzMDAxUk9JXHU0RTA5XHU0RTJBXHU1MTczXHU5NTJFXHU2MzA3XHU2ODA3XHU1NzI4XHU2NUY2XHU5NUY0XHU3RUY0XHU1RUE2XHU0RTBBXHU3Njg0XHU1M0Q4XHU1MzE2XHU4RDhCXHU1MkJGJ1xuICAgICAgICAgIH1cbiAgICAgICAgfSxcbiAgICAgICAgdGFibGVEYXRhOiB7XG4gICAgICAgICAgdGl0bGU6ICdcdTY1NDhcdTY3OUNcdTUyMDZcdTY3OTBcdTYzMDdcdTY4MDcnLFxuICAgICAgICAgIGhlYWRlcnM6IFsnXHU2MzA3XHU2ODA3XHU1NDBEXHU3OUYwJywgJ0lWXHU1MDNDJywgJ1dPRVx1NTAzQycsICdcdTRGRTFcdTYwNkZcdTUwM0MnXSxcbiAgICAgICAgICByb3dzOiBbXG4gICAgICAgICAgICBbJ1x1NjMwN1x1NjgwNzEnLCAnMC4zNDInLCAnMS4yNTYnLCAnMC40MjgnXSxcbiAgICAgICAgICAgIFsnXHU2MzA3XHU2ODA3MicsICcwLjI4NycsICcwLjk0MycsICcwLjM3MSddLFxuICAgICAgICAgICAgWydcdTYzMDdcdTY4MDczJywgJzAuMTk1JywgJzAuNjcyJywgJzAuMjg5J11cbiAgICAgICAgICBdXG4gICAgICAgIH0sXG4gICAgICAgIGxhc3RNb2RpZmllZDogJzIwMjQtMTItMDcgMTY6MzA6MDAnXG4gICAgICB9LFxuICAgICAge1xuICAgICAgICBpZDogNixcbiAgICAgICAgbmFtZTogJ1x1NjU0OFx1Njc5Q1x1NTIwNlx1Njc5MC1cdTUyMDZcdTVFNzNcdTUzRjAnLFxuICAgICAgICB0eXBlOiAndGV4dF9hbmRfY2hhcnRfYW5kX3RhYmxlJyxcbiAgICAgICAgZWRpdFR5cGU6ICd0ZXh0X2FuZF9jaGFydF9hbmRfdGFibGUnLFxuICAgICAgICBzdGF0dXM6ICdjb21wbGV0ZWQnLFxuICAgICAgICBlZGl0YWJsZTogdHJ1ZSxcbiAgICAgICAgdGV4dENvbnRlbnQ6ICdcdTUyMDZcdTVFNzNcdTUzRjBcdTY1NDhcdTY3OUNcdTVCRjlcdTZCRDRcdTY2M0VcdTc5M0FpT1NcdTVFNzNcdTUzRjBcdTg4NjhcdTczQjBcdTY3MDBcdTRGNzNcdUZGMENcdThGNkNcdTUzMTZcdTczODdcdThGQkVcdTUyMzA0LjglXHVGRjBDQW5kcm9pZFx1NUU3M1x1NTNGMFx1NkIyMVx1NEU0Qlx1NEUzQTQuMSVcdUZGMENXZWJcdTVFNzNcdTUzRjBcdTc2RjhcdTVCRjlcdThGODNcdTRGNEVcdTRFM0EzLjIlXHUzMDAyXHU1NDA0XHU1RTczXHU1M0YwXHU3QTMzXHU1QjlBXHU2MDI3XHU2MzA3XHU2ODA3XHU1NzQ3XHU1NzI4XHU1NDA4XHU3NDA2XHU4MzAzXHU1NkY0XHU1MTg1XHVGRjBDaU9TXHU1RTczXHU1M0YwXHU3Njg0XHU3NTI4XHU2MjM3XHU4RDI4XHU5MUNGXHU1NDhDXHU4RjZDXHU1MzE2XHU2REYxXHU1RUE2XHU2NjBFXHU2NjNFXHU0RjE4XHU0RThFXHU1MTc2XHU0RUQ2XHU1RTczXHU1M0YwXHUzMDAyJyxcbiAgICAgICAgY2hhcnREYXRhOiB7XG4gICAgICAgICAgcGxhdGZvcm1Db21wYXJpc29uOiB7XG4gICAgICAgICAgICB0aXRsZTogJ1x1NTIwNlx1NUU3M1x1NTNGMFx1NjU0OFx1Njc5Q1x1NUJGOVx1NkJENCcsXG4gICAgICAgICAgICB0eXBlOiAnaW1hZ2UnLFxuICAgICAgICAgICAgaW1hZ2VQYXRoOiAnL2NoYXJ0cy9wbGF0Zm9ybV9jb21wYXJpc29uX2NoYXJ0LnN2ZycsXG4gICAgICAgICAgICBkZXNjcmlwdGlvbjogJ1x1NUM1NVx1NzkzQWlPU1x1MzAwMUFuZHJvaWRcdTMwMDFXZWJcdTRFMDlcdTRFMkFcdTVFNzNcdTUzRjBcdTc2ODRDVFJcdTMwMDFDVlJcdTMwMDFST0lcdTVCRjlcdTZCRDRcdTY1NzBcdTYzNkUnXG4gICAgICAgICAgfSxcbiAgICAgICAgICBzdGFiaWxpdHlSYWRhcjoge1xuICAgICAgICAgICAgdGl0bGU6ICdcdTVFNzNcdTUzRjBcdTdBMzNcdTVCOUFcdTYwMjdcdTk2RjdcdThGQkVcdTU2RkUnLFxuICAgICAgICAgICAgdHlwZTogJ2ltYWdlJyxcbiAgICAgICAgICAgIGltYWdlUGF0aDogJy9jaGFydHMvc3RhYmlsaXR5X3JhZGFyX2NoYXJ0LnN2ZycsXG4gICAgICAgICAgICBkZXNjcmlwdGlvbjogJ1x1NUM1NVx1NzkzQVx1NTQwNFx1NUU3M1x1NTNGMFx1NTcyOFx1OEY2Q1x1NTMxNlx1N0EzM1x1NUI5QVx1NjAyN1x1MzAwMVx1NjIxMFx1NjcyQ1x1N0EzM1x1NUI5QVx1NjAyN1x1MzAwMVx1OEQyOFx1OTFDRlx1N0EzM1x1NUI5QVx1NjAyN1x1MzAwMVx1NjVGNlx1OTVGNFx1N0EzM1x1NUI5QVx1NjAyN1x1MzAwMVx1NkUyMFx1OTA1M1x1N0EzM1x1NUI5QVx1NjAyN1x1NEU5NFx1NEUyQVx1N0VGNFx1NUVBNlx1NzY4NFx1ODg2OFx1NzNCMCdcbiAgICAgICAgICB9XG4gICAgICAgIH0sXG4gICAgICAgIHRhYmxlRGF0YToge1xuICAgICAgICAgIHRpdGxlOiAnXHU1MjA2XHU1RTczXHU1M0YwXHU2NTQ4XHU2NzlDXHU1MjA2XHU2NzkwXHU2MzA3XHU2ODA3JyxcbiAgICAgICAgICBoZWFkZXJzOiBbJ1x1NUU3M1x1NTNGMCcsICdJVlx1NTAzQycsICdXT0VcdTUwM0MnLCAnXHU0RkUxXHU2MDZGXHU1MDNDJ10sXG4gICAgICAgICAgcm93czogW1xuICAgICAgICAgICAgWydpT1MnLCAnMC4zOTgnLCAnMS40MjUnLCAnMC41NjcnXSxcbiAgICAgICAgICAgIFsnQW5kcm9pZCcsICcwLjMxMicsICcxLjA4OScsICcwLjQ0NSddLFxuICAgICAgICAgICAgWydXZWInLCAnMC4yMzQnLCAnMC43NTYnLCAnMC4yOTgnXVxuICAgICAgICAgIF1cbiAgICAgICAgfSxcbiAgICAgICAgbGFzdE1vZGlmaWVkOiAnMjAyNC0xMi0wNyAxNjozMDowMCdcbiAgICAgIH0sXG4gICAgICB7XG4gICAgICAgIGlkOiA3LFxuICAgICAgICBuYW1lOiAnXHU2NTcwXHU2MzZFXHU3RUQzXHU4QkJBJyxcbiAgICAgICAgdHlwZTogJ3RleHQnLFxuICAgICAgICBlZGl0VHlwZTogJ3RleHRfb25seScsXG4gICAgICAgIHN0YXR1czogJ2NvbXBsZXRlZCcsXG4gICAgICAgIGVkaXRhYmxlOiB0cnVlLFxuICAgICAgICBjb250ZW50OiAnXHU1N0ZBXHU0RThFMTIsMzQ1XHU2NzYxXHU2ODM3XHU2NzJDXHU2NTcwXHU2MzZFXHU3Njg0XHU1MjA2XHU2NzkwXHU3RUQzXHU2NzlDXHVGRjBDXHU0RUE3XHU1NEMxQVx1NTcyODIwMjRcdTVFNzQxMVx1NjcwOFx1NjcxRlx1OTVGNFx1ODg2OFx1NzNCMFx1NEYxOFx1NUYwMlx1RkYwQ1x1NjU3NFx1NEY1M1JPSVx1OEZCRVx1NTIzMDIuM1x1RkYwQ1x1OEQ4NVx1NTFGQVx1OTg4NFx1NjcxRlx1NzZFRVx1NjgwN1x1MzAwMlx1NUVGQVx1OEJBRVx1RkYxQTFcdUZGMDlcdTdFRTdcdTdFRURcdTUyQTBcdTU5MjdpT1NcdTVFNzNcdTUzRjBcdTYyOTVcdTY1M0VcdTUyOUJcdTVFQTZcdUZGMENcdThCRTVcdTVFNzNcdTUzRjBcdThGNkNcdTUzMTZcdTY1NDhcdTY3OUNcdTY3MDBcdTRGNzNcdUZGMUIyXHVGRjA5XHU0RjE4XHU1MzE2QW5kcm9pZFx1NUU3M1x1NTNGMFx1NzY4NFx1NjI5NVx1NjUzRVx1N0I1Nlx1NzU2NVx1RkYwQ1x1NjNEMFx1NTM0N1x1OEY2Q1x1NTMxNlx1NkRGMVx1NUVBNlx1RkYxQjNcdUZGMDlcdTkxQ0RcdTY1QjBcdThCQzRcdTRGMzBXZWJcdTVFNzNcdTUzRjBcdTYyOTVcdTY1M0VcdTRFRjdcdTUwM0NcdUZGMENcdTgwMDNcdTg2NTFcdThDMDNcdTY1NzRcdTk4ODRcdTdCOTdcdTUyMDZcdTkxNERcdUZGMUI0XHVGRjA5XHU0RkREXHU2MzAxXHU1RjUzXHU1MjREXHU2Mjk1XHU2NTNFXHU4MjgyXHU1OTRGXHVGRjBDXHU2NTQ4XHU2NzlDXHU2MzA3XHU2ODA3XHU3QTMzXHU1QjlBXHU0RTE0XHU2MzAxXHU3RUVEXHU1NDExXHU1OTdEXHUzMDAyXHU1NDBFXHU3RUVEXHU4QkExXHU1MjEyXHU1NzI4MTJcdTY3MDhcdTRFRkRcdTYyNjlcdTU5MjdcdTYyOTVcdTY1M0VcdTg5QzRcdTZBMjFcdUZGMENcdTk4ODRcdTY3MUZcdTY1NzRcdTRGNTNST0lcdTUzRUZcdTYzRDBcdTUzNDdcdTgxRjMyLjVcdTRFRTVcdTRFMEFcdTMwMDInLFxuICAgICAgICB3b3JkTGltaXQ6IDUwMDAsXG4gICAgICAgIGxhc3RNb2RpZmllZDogJzIwMjQtMTItMDcgMTY6MzA6MDAnXG4gICAgICB9XG4gICAgXSxcbiAgICBcbiAgICAvLyBcdTY4MzdcdTY3MkNcdTY1ODdcdTRFRjZcdTRGRTFcdTYwNkZcbiAgICBzYW1wbGVGaWxlczogW1xuICAgICAge1xuICAgICAgICBpZDogMSxcbiAgICAgICAgZmlsZU5hbWU6ICdwcm9kdWN0X2Ffc2FtcGxlXzIwMjQxMS5jc3YnLFxuICAgICAgICBmaWxlU2l6ZTogJzIuNU1CJyxcbiAgICAgICAgdXBsb2FkVGltZTogJzIwMjQtMTEtMzAgMDk6MDA6MDAnLFxuICAgICAgICBzdGF0dXM6ICdwcm9jZXNzZWQnLFxuICAgICAgICByZWNvcmRDb3VudDogMTIzNDVcbiAgICAgIH0sXG4gICAgICB7XG4gICAgICAgIGlkOiAyLFxuICAgICAgICBmaWxlTmFtZTogJ2NvbnRyb2xfZ3JvdXBfMjAyNDExLmNzdicsXG4gICAgICAgIGZpbGVTaXplOiAnMS44TUInLFxuICAgICAgICB1cGxvYWRUaW1lOiAnMjAyNC0xMS0zMCAwOTowNTowMCcsXG4gICAgICAgIHN0YXR1czogJ3Byb2Nlc3NlZCcsXG4gICAgICAgIHJlY29yZENvdW50OiA4OTc2XG4gICAgICB9XG4gICAgXSxcbiAgICBcbiAgICAvLyBcdTUxNzNcdTk1MkVcdTYzMDdcdTY4MDdcdTZDNDdcdTYwM0JcbiAgICBrZXlNZXRyaWNzOiB7XG4gICAgICB0b3RhbEltcHJlc3Npb25zOiAxMjUwMDAwLFxuICAgICAgdG90YWxDbGlja3M6IDk4NTAwLFxuICAgICAgdG90YWxDb252ZXJzaW9uczogODQyMCxcbiAgICAgIG92ZXJhbGxDVFI6IDAuMDc4OCxcbiAgICAgIG92ZXJhbGxDVlI6IDAuMDg1NSxcbiAgICAgIHRvdGFsQ29zdDogMTU2NzgwLFxuICAgICAgYXZnQ1BDOiAxLjU5LFxuICAgICAgYXZnQ1BBOiAxOC42MixcbiAgICAgIHJvaTogMi4zXG4gICAgfSxcbiAgICBcbiAgICAvLyBcdTUyMDZcdTY3OTBcdTZENDFcdTdBMEJcdTZCNjVcdTlBQTRcdUZGMDhcdTdCMjZcdTU0MDhcdTk3MDBcdTZDNDJcdTY1ODdcdTY4NjNcdTc2ODQ5XHU0RTJBXHU2QjY1XHU5QUE0XHVGRjA5XG4gICAgYW5hbHlzaXNTdGVwczogW1xuICAgICAge1xuICAgICAgICBzdGVwOiAxLFxuICAgICAgICBuYW1lOiAnXHU2NTg3XHU0RUY2XHU2NTcwXHU2MzZFXHU4OUUzXHU2NzkwXHU0RTBFXHU5QThDXHU4QkMxJyxcbiAgICAgICAgc3RhdHVzOiAnY29tcGxldGVkJyxcbiAgICAgICAgc3RhcnRUaW1lOiAnMjAyNC0xMi0wNyAxNjowMDowMCcsXG4gICAgICAgIGVuZFRpbWU6ICcyMDI0LTEyLTA3IDE2OjAwOjA4JyxcbiAgICAgICAgZHVyYXRpb246ICc4XHU3OUQyJyxcbiAgICAgICAgZGVzY3JpcHRpb246ICdcdTg5RTNcdTY3OTBDU1ZcdTY1ODdcdTRFRjZcdTVFNzZcdTlBOENcdThCQzFcdTY1NzBcdTYzNkVcdTY4M0NcdTVGMEYnXG4gICAgICB9LFxuICAgICAge1xuICAgICAgICBzdGVwOiAyLFxuICAgICAgICBuYW1lOiAnXHU2NTcwXHU2MzZFXHU4RDI4XHU5MUNGXHU2OEMwXHU2N0U1XHU0RTBFXHU2RTA1XHU2RDE3JyxcbiAgICAgICAgc3RhdHVzOiAnY29tcGxldGVkJyxcbiAgICAgICAgc3RhcnRUaW1lOiAnMjAyNC0xMi0wNyAxNjowMDowOCcsXG4gICAgICAgIGVuZFRpbWU6ICcyMDI0LTEyLTA3IDE2OjAwOjIwJyxcbiAgICAgICAgZHVyYXRpb246ICcxMlx1NzlEMicsXG4gICAgICAgIGRlc2NyaXB0aW9uOiAnXHU2OEMwXHU2N0U1XHU2NTcwXHU2MzZFXHU4RDI4XHU5MUNGXHU1RTc2XHU2RTA1XHU2RDE3XHU1RjAyXHU1RTM4XHU2NTcwXHU2MzZFJ1xuICAgICAgfSxcbiAgICAgIHtcbiAgICAgICAgc3RlcDogMyxcbiAgICAgICAgbmFtZTogJ1x1NTM1NVx1NEVBN1x1NTRDMVx1NTE3M1x1OTUyRVx1NjMwN1x1NjgwN1x1OEJBMVx1N0I5NycsXG4gICAgICAgIHN0YXR1czogJ2NvbXBsZXRlZCcsXG4gICAgICAgIHN0YXJ0VGltZTogJzIwMjQtMTItMDcgMTY6MDA6MjAnLFxuICAgICAgICBlbmRUaW1lOiAnMjAyNC0xMi0wNyAxNjowMDozNScsXG4gICAgICAgIGR1cmF0aW9uOiAnMTVcdTc5RDInLFxuICAgICAgICBkZXNjcmlwdGlvbjogJ1x1OEJBMVx1N0I5N0NUUlx1MzAwMUNWUlx1MzAwMVJPSVx1N0I0OVx1NTE3M1x1OTUyRVx1NjMwN1x1NjgwNydcbiAgICAgIH0sXG4gICAgICB7XG4gICAgICAgIHN0ZXA6IDQsXG4gICAgICAgIG5hbWU6ICdcdTY4MzdcdTY3MkNcdTk5NzFcdTU0OENcdTVFQTZcdTUyMDZcdTY3OTAnLFxuICAgICAgICBzdGF0dXM6ICdjb21wbGV0ZWQnLFxuICAgICAgICBzdGFydFRpbWU6ICcyMDI0LTEyLTA3IDE2OjAwOjM1JyxcbiAgICAgICAgZW5kVGltZTogJzIwMjQtMTItMDcgMTY6MDA6NDInLFxuICAgICAgICBkdXJhdGlvbjogJzdcdTc5RDInLFxuICAgICAgICBkZXNjcmlwdGlvbjogJ1x1NTIwNlx1Njc5MFx1NjgzN1x1NjcyQ1x1OTk3MVx1NTQ4Q1x1NUVBNlx1NTQ4Q1x1NEVFM1x1ODg2OFx1NjAyNydcbiAgICAgIH0sXG4gICAgICB7XG4gICAgICAgIHN0ZXA6IDUsXG4gICAgICAgIG5hbWU6ICdcdTc2RjhcdTUxNzNcdTYwMjdcdTYzMDdcdTY4MDdcdThCQTFcdTdCOTcnLFxuICAgICAgICBzdGF0dXM6ICdjb21wbGV0ZWQnLFxuICAgICAgICBzdGFydFRpbWU6ICcyMDI0LTEyLTA3IDE2OjAwOjQyJyxcbiAgICAgICAgZW5kVGltZTogJzIwMjQtMTItMDcgMTY6MDE6MDUnLFxuICAgICAgICBkdXJhdGlvbjogJzIzXHU3OUQyJyxcbiAgICAgICAgZGVzY3JpcHRpb246ICdcdThCQTFcdTdCOTdcdTU0MDRcdTdFRjRcdTVFQTZcdTc2RjhcdTUxNzNcdTYwMjdcdTdDRkJcdTY1NzAnXG4gICAgICB9LFxuICAgICAge1xuICAgICAgICBzdGVwOiA2LFxuICAgICAgICBuYW1lOiAnXHU1MTY4XHU1RTczXHU1M0YwXHU2NTQ4XHU2NzlDXHU1MjA2XHU2NzkwJyxcbiAgICAgICAgc3RhdHVzOiAnY29tcGxldGVkJyxcbiAgICAgICAgc3RhcnRUaW1lOiAnMjAyNC0xMi0wNyAxNjowMTowNScsXG4gICAgICAgIGVuZFRpbWU6ICcyMDI0LTEyLTA3IDE2OjAxOjI1JyxcbiAgICAgICAgZHVyYXRpb246ICcyMFx1NzlEMicsXG4gICAgICAgIGRlc2NyaXB0aW9uOiAnXHU1MjA2XHU2NzkwXHU1MTY4XHU1RTczXHU1M0YwXHU2NTc0XHU0RjUzXHU2NTQ4XHU2NzlDXHU4ODY4XHU3M0IwJ1xuICAgICAgfSxcbiAgICAgIHtcbiAgICAgICAgc3RlcDogNyxcbiAgICAgICAgbmFtZTogJ1x1NTIwNlx1NUU3M1x1NTNGMFx1NjU0OFx1Njc5Q1x1NTIwNlx1Njc5MCcsXG4gICAgICAgIHN0YXR1czogJ2NvbXBsZXRlZCcsXG4gICAgICAgIHN0YXJ0VGltZTogJzIwMjQtMTItMDcgMTY6MDE6MjUnLFxuICAgICAgICBlbmRUaW1lOiAnMjAyNC0xMi0wNyAxNjowMTo0NScsXG4gICAgICAgIGR1cmF0aW9uOiAnMjBcdTc5RDInLFxuICAgICAgICBkZXNjcmlwdGlvbjogJ1x1NUJGOVx1NkJENFx1NTIwNlx1Njc5MFx1NTQwNFx1NUU3M1x1NTNGMFx1NjU0OFx1Njc5Q1x1NURFRVx1NUYwMidcbiAgICAgIH0sXG4gICAgICB7XG4gICAgICAgIHN0ZXA6IDgsXG4gICAgICAgIG5hbWU6ICdcdTU2RkVcdTg4NjhcdTgxRUFcdTUyQThcdTc1MUZcdTYyMTAnLFxuICAgICAgICBzdGF0dXM6ICdjb21wbGV0ZWQnLFxuICAgICAgICBzdGFydFRpbWU6ICcyMDI0LTEyLTA3IDE2OjAxOjQ1JyxcbiAgICAgICAgZW5kVGltZTogJzIwMjQtMTItMDcgMTY6MDI6MDAnLFxuICAgICAgICBkdXJhdGlvbjogJzE1XHU3OUQyJyxcbiAgICAgICAgZGVzY3JpcHRpb246ICdcdTc1MUZcdTYyMTBcdTZGMEZcdTY1OTdcdTU2RkVcdTMwMDFcdThEOEJcdTUyQkZcdTU2RkVcdTdCNDlcdTUzRUZcdTg5QzZcdTUzMTZcdTU2RkVcdTg4NjgnXG4gICAgICB9LFxuICAgICAge1xuICAgICAgICBzdGVwOiA5LFxuICAgICAgICBuYW1lOiAnXHU3RUQzXHU4QkJBXHU2QTIxXHU2NzdGXHU1ODZCXHU1MTQ1JyxcbiAgICAgICAgc3RhdHVzOiAnY29tcGxldGVkJyxcbiAgICAgICAgc3RhcnRUaW1lOiAnMjAyNC0xMi0wNyAxNjowMjowMCcsXG4gICAgICAgIGVuZFRpbWU6ICcyMDI0LTEyLTA3IDE2OjAyOjA1JyxcbiAgICAgICAgZHVyYXRpb246ICc1XHU3OUQyJyxcbiAgICAgICAgZGVzY3JpcHRpb246ICdcdTU4NkJcdTUxNDVcdTUyMDZcdTY3OTBcdTdFRDNcdThCQkFcdTU0OENcdTVFRkFcdThCQUVcdTZBMjFcdTY3N0YnXG4gICAgICB9XG4gICAgXVxuICB9O1xufTtcblxuLy8gXHU3NTFGXHU2MjEwXHU4QkM0XHU0RjMwXHU2MkE1XHU1NDRBXHU4QkU2XHU2MEM1XHU2NTcwXHU2MzZFXG5jb25zdCBnZW5lcmF0ZUV2YWx1YXRpb25SZXBvcnREZXRhaWwgPSAoaWQ6IHN0cmluZykgPT4ge1xuICBjb25zdCByZXBvcnRJZCA9IHBhcnNlSW50KGlkKTtcbiAgXG4gIC8vIFx1NEUzQUlEXHU0RTNBMTBcdTc2ODRcdTYyQTVcdTU0NEFcdTYzRDBcdTRGOUJcdTcyNzlcdTZCOEFcdTc2ODRcdTUzRUZcdTdGMTZcdThGOTFcdTcyQjZcdTYwMDFcbiAgaWYgKHJlcG9ydElkID09PSAxMCkge1xuICAgIHJldHVybiBnZW5lcmF0ZUVkaXRhYmxlUmVwb3J0RGV0YWlsKHJlcG9ydElkKTtcbiAgfVxuICBcbiAgY29uc3Qgc3RhdHVzZXMgPSBbJ2NvbXBsZXRlZCcsICdwcm9jZXNzaW5nJywgJ2ZhaWxlZCcsICdwZW5kaW5nJywgJ3BhdXNlZCddO1xuICBjb25zdCBzdGF0dXMgPSBzdGF0dXNlc1tyZXBvcnRJZCAlIHN0YXR1c2VzLmxlbmd0aF07XG4gIFxuICBjb25zdCBiYXNlRGF0YSA9IHtcbiAgICBpZDogcmVwb3J0SWQsXG4gICAgcmVwb3J0TmFtZTogYFx1NEVBN1x1NTRDMSR7U3RyaW5nLmZyb21DaGFyQ29kZSg2NSArIChyZXBvcnRJZCAlIDQpKX1cdTY1NDhcdTY3OUNcdThCQzRcdTRGMzBcdTYyQTVcdTU0NEFfJHtuZXcgRGF0ZSgpLnRvSVNPU3RyaW5nKCkuc3BsaXQoJ1QnKVswXS5yZXBsYWNlKC8tL2csICcnKX1gLFxuICAgIHByb2R1Y3ROYW1lOiBgXHU0RUE3XHU1NEMxJHtTdHJpbmcuZnJvbUNoYXJDb2RlKDY1ICsgKHJlcG9ydElkICUgNCkpfWAsXG4gICAgcmVwb3J0VHlwZTogJ1x1NjU0OFx1Njc5Q1x1OEJDNFx1NEYzMCcsXG4gICAgYW5hbHlzaXNUeXBlOiAnXHU1NDY4XHU2NzFGXHU2MDI3XHU1MjA2XHU2NzkwJyxcbiAgICBnZW5lcmF0ZURhdGU6IG5ldyBEYXRlKCkudG9JU09TdHJpbmcoKS5zcGxpdCgnVCcpWzBdLFxuICAgIHN0YXR1cyxcbiAgICBwcm9ncmVzczogc3RhdHVzID09PSAnY29tcGxldGVkJyA/IDEwMCA6IChzdGF0dXMgPT09ICdwcm9jZXNzaW5nJyA/IE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIDgwKSArIDEwIDogTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogNTApKSxcbiAgICBzYW1wbGVUaW1lU3BhbjogJzIwMjQtMTEtMDEgXHU4MUYzIDIwMjQtMTEtMzAnLFxuICAgIHRlbXBsYXRlVHlwZTogJ1x1NjgwN1x1NTFDNlx1NkEyMVx1Njc3RicsXG4gICAgYW5hbHlzaXNUaW1lOiBzdGF0dXMgPT09ICdjb21wbGV0ZWQnID8gYCR7bmV3IERhdGUoKS50b0lTT1N0cmluZygpLnNwbGl0KCdUJylbMF19IDE0OjIwOjAwYCA6IG51bGwsXG4gICAgZmFpbHVyZVJlYXNvbjogc3RhdHVzID09PSAnZmFpbGVkJyA/ICdcdTY1NzBcdTYzNkVcdTZFOTBcdThGREVcdTYzQTVcdTU5MzFcdThEMjUnIDogbnVsbCxcbiAgICBcbiAgICAvLyBcdTYyQTVcdTU0NEFcdTZBMjFcdTU3NTdcbiAgICBtb2R1bGVzOiBbXG4gICAgICB7XG4gICAgICAgIGlkOiAxLFxuICAgICAgICBuYW1lOiAnXHU2RDRCXHU4QkQ1XHU4MENDXHU2NjZGJyxcbiAgICAgICAgc3RhdHVzOiBzdGF0dXMgPT09ICdjb21wbGV0ZWQnID8gJ2NvbXBsZXRlZCcgOiAoc3RhdHVzID09PSAncHJvY2Vzc2luZycgPyAncHJvY2Vzc2luZycgOiAncGVuZGluZycpLFxuICAgICAgICBjb250ZW50OiBzdGF0dXMgPT09ICdjb21wbGV0ZWQnID8gJ1x1NjcyQ1x1NkIyMVx1NkQ0Qlx1OEJENVx1OTQ4OFx1NUJGOVx1NEVBN1x1NTRDMUFcdTU3MjgyMDI0XHU1RTc0MTFcdTY3MDhcdTc2ODRcdTY1NDhcdTY3OUNcdThGREJcdTg4NENcdTUxNjhcdTk3NjJcdThCQzRcdTRGMzAuLi4nIDogbnVsbFxuICAgICAgfSxcbiAgICAgIHtcbiAgICAgICAgaWQ6IDIsXG4gICAgICAgIG5hbWU6ICdcdTRFQTdcdTU0QzFcdTRFQ0JcdTdFQ0QnLFxuICAgICAgICBzdGF0dXM6IHN0YXR1cyA9PT0gJ2NvbXBsZXRlZCcgPyAnY29tcGxldGVkJyA6IChzdGF0dXMgPT09ICdwcm9jZXNzaW5nJyA/ICdwcm9jZXNzaW5nJyA6ICdwZW5kaW5nJyksXG4gICAgICAgIGNvbnRlbnQ6IHN0YXR1cyA9PT0gJ2NvbXBsZXRlZCcgPyAnXHU0RUE3XHU1NEMxQVx1NjYyRlx1NEUwMFx1NkIzRVx1OTc2Mlx1NTQxMVx1NEUyRFx1NUMwRlx1NEYwMVx1NEUxQVx1NzY4NFx1OTFEMVx1ODc4RFx1NjcwRFx1NTJBMVx1NEVBN1x1NTRDMS4uLicgOiBudWxsXG4gICAgICB9LFxuICAgICAge1xuICAgICAgICBpZDogMyxcbiAgICAgICAgbmFtZTogJ1x1NjgzN1x1NjcyQ1x1N0VDNFx1NjIxMCcsXG4gICAgICAgIHN0YXR1czogc3RhdHVzID09PSAnY29tcGxldGVkJyA/ICdjb21wbGV0ZWQnIDogKHN0YXR1cyA9PT0gJ3Byb2Nlc3NpbmcnID8gJ3Byb2Nlc3NpbmcnIDogJ3BlbmRpbmcnKSxcbiAgICAgICAgY29udGVudDogc3RhdHVzID09PSAnY29tcGxldGVkJyA/ICdcdTY3MkNcdTZCMjFcdTUyMDZcdTY3OTBcdTUxNzFcdTUzMDVcdTU0MkJcdTY4MzdcdTY3MkNcdTY1NzBcdTYzNkUxMiwzNDVcdTY3NjEuLi4nIDogbnVsbFxuICAgICAgfSxcbiAgICAgIHtcbiAgICAgICAgaWQ6IDQsXG4gICAgICAgIG5hbWU6ICdcdTYwM0JcdTY4MzdcdTY3MkNcdTY5ODJcdTUxQjUnLFxuICAgICAgICBzdGF0dXM6IHN0YXR1cyA9PT0gJ2NvbXBsZXRlZCcgPyAnY29tcGxldGVkJyA6IChzdGF0dXMgPT09ICdwcm9jZXNzaW5nJyA/ICdjb21wbGV0ZWQnIDogJ3BlbmRpbmcnKSxcbiAgICAgICAgY29udGVudDogc3RhdHVzID09PSAnY29tcGxldGVkJyA/ICdcdTY4MzdcdTY3MkNcdTYwM0JcdTRGNTNcdTUyMDZcdTVFMDNcdTU3NDdcdTUzMDBcdUZGMENcdTg5ODZcdTc2RDZcdTU0MDRcdTRFMkFcdTRFMUFcdTUyQTFcdTU3M0FcdTY2NkYuLi4nIDogbnVsbFxuICAgICAgfSxcbiAgICAgIHtcbiAgICAgICAgaWQ6IDUsXG4gICAgICAgIG5hbWU6ICdcdTY1NDhcdTY3OUNcdTUyMDZcdTY3OTAnLFxuICAgICAgICBzdGF0dXM6IHN0YXR1cyA9PT0gJ2NvbXBsZXRlZCcgPyAnY29tcGxldGVkJyA6IChzdGF0dXMgPT09ICdwcm9jZXNzaW5nJyA/ICdwcm9jZXNzaW5nJyA6ICdwZW5kaW5nJyksXG4gICAgICAgIGNvbnRlbnQ6IHN0YXR1cyA9PT0gJ2NvbXBsZXRlZCcgPyAnXHU5MDFBXHU4RkM3XHU1QkY5XHU2QkQ0XHU1MjA2XHU2NzkwXHVGRjBDXHU0RUE3XHU1NEMxQVx1NTcyOFx1NzZFRVx1NjgwN1x1NjMwN1x1NjgwN1x1NEUwQVx1ODg2OFx1NzNCMFx1ODI2Rlx1NTk3RC4uLicgOiBudWxsXG4gICAgICB9LFxuICAgICAge1xuICAgICAgICBpZDogNixcbiAgICAgICAgbmFtZTogJ1x1NTIwNlx1NUU3M1x1NTNGMFx1NjU0OFx1Njc5QycsXG4gICAgICAgIHN0YXR1czogc3RhdHVzID09PSAnY29tcGxldGVkJyA/ICdjb21wbGV0ZWQnIDogKHN0YXR1cyA9PT0gJ3Byb2Nlc3NpbmcnID8gJ3Byb2Nlc3NpbmcnIDogJ3BlbmRpbmcnKSxcbiAgICAgICAgY29udGVudDogc3RhdHVzID09PSAnY29tcGxldGVkJyA/ICdcdTU0MDRcdTVFNzNcdTUzRjBcdTY1NDhcdTY3OUNcdTVERUVcdTVGMDJcdTUyMDZcdTY3OTBcdTY2M0VcdTc5M0EuLi4nIDogbnVsbFxuICAgICAgfSxcbiAgICAgIHtcbiAgICAgICAgaWQ6IDcsXG4gICAgICAgIG5hbWU6ICdcdTYwM0JcdTdFRDNcdTVFRkFcdThCQUUnLFxuICAgICAgICBzdGF0dXM6IHN0YXR1cyA9PT0gJ2NvbXBsZXRlZCcgPyAnY29tcGxldGVkJyA6IChzdGF0dXMgPT09ICdwcm9jZXNzaW5nJyA/ICdwZW5kaW5nJyA6ICdwZW5kaW5nJyksXG4gICAgICAgIGNvbnRlbnQ6IHN0YXR1cyA9PT0gJ2NvbXBsZXRlZCcgPyAnXHU1N0ZBXHU0RThFXHU2NzJDXHU2QjIxXHU4QkM0XHU0RjMwXHU3RUQzXHU2NzlDXHVGRjBDXHU1RUZBXHU4QkFFLi4uJyA6IG51bGxcbiAgICAgIH1cbiAgICBdLFxuICAgIFxuICAgIC8vIFx1NjgzN1x1NjcyQ1x1NjU4N1x1NEVGNlx1NEZFMVx1NjA2RlxuICAgIHNhbXBsZUZpbGVzOiBbXG4gICAgICB7XG4gICAgICAgIGlkOiAxLFxuICAgICAgICBmaWxlTmFtZTogJ3NhbXBsZV9kYXRhXzIwMjQxMS5jc3YnLFxuICAgICAgICBmaWxlU2l6ZTogJzIuNU1CJyxcbiAgICAgICAgdXBsb2FkVGltZTogJzIwMjQtMTEtMzAgMDk6MDA6MDAnLFxuICAgICAgICBzdGF0dXM6ICdwcm9jZXNzZWQnXG4gICAgICB9LFxuICAgICAge1xuICAgICAgICBpZDogMixcbiAgICAgICAgZmlsZU5hbWU6ICdjb250cm9sX2dyb3VwXzIwMjQxMS5jc3YnLFxuICAgICAgICBmaWxlU2l6ZTogJzEuOE1CJyxcbiAgICAgICAgdXBsb2FkVGltZTogJzIwMjQtMTEtMzAgMDk6MDU6MDAnLFxuICAgICAgICBzdGF0dXM6ICdwcm9jZXNzZWQnXG4gICAgICB9XG4gICAgXVxuICB9O1xuICBcbiAgLy8gXHU2ODM5XHU2MzZFXHU3MkI2XHU2MDAxXHU2REZCXHU1MkEwXHU0RTBEXHU1NDBDXHU3Njg0XHU2NTcwXHU2MzZFXG4gIGlmIChzdGF0dXMgPT09ICdjb21wbGV0ZWQnIHx8IHN0YXR1cyA9PT0gJ3Byb2Nlc3NpbmcnKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIC4uLmJhc2VEYXRhLFxuICAgICAgLy8gXHU1MjA2XHU1RTczXHU1M0YwXHU2NTQ4XHU2NzlDXHU1MjA2XHU2NzkwXHU2NTcwXHU2MzZFXG4gICAgICBwbGF0Zm9ybUFuYWx5c2lzOiB7XG4gICAgICAgIHBsYXRmb3JtczogWydcdTVCNTdcdTgyODInLCAnXHU4NjgyXHU4NjgxJywgJ1x1NEVBQ1x1NEUxQycsICdcdTdGOEVcdTU2RTInXSxcbiAgICAgICAgZGF0YTogW1xuICAgICAgICAgIHtcbiAgICAgICAgICAgIHBsYXRmb3JtOiAnXHU1QjU3XHU4MjgyJyxcbiAgICAgICAgICAgIHRvdGFsU2FtcGxlczogMzIwMCxcbiAgICAgICAgICAgIHZhbGlkU2FtcGxlczogMzE1MCxcbiAgICAgICAgICAgIGNvbnZlcnNpb25SYXRlOiAwLjA4NDUsXG4gICAgICAgICAgICBhdmdDb3N0OiAxMi41LFxuICAgICAgICAgICAgcm9pOiAyLjNcbiAgICAgICAgICB9LFxuICAgICAgICAgIHtcbiAgICAgICAgICAgIHBsYXRmb3JtOiAnXHU4NjgyXHU4NjgxJyxcbiAgICAgICAgICAgIHRvdGFsU2FtcGxlczogMjgwMCxcbiAgICAgICAgICAgIHZhbGlkU2FtcGxlczogMjc1MCxcbiAgICAgICAgICAgIGNvbnZlcnNpb25SYXRlOiAwLjA5MjAsXG4gICAgICAgICAgICBhdmdDb3N0OiAxNS4yLFxuICAgICAgICAgICAgcm9pOiAyLjFcbiAgICAgICAgICB9LFxuICAgICAgICAgIHtcbiAgICAgICAgICAgIHBsYXRmb3JtOiAnXHU0RUFDXHU0RTFDJyxcbiAgICAgICAgICAgIHRvdGFsU2FtcGxlczogMzUwMCxcbiAgICAgICAgICAgIHZhbGlkU2FtcGxlczogMzQyMCxcbiAgICAgICAgICAgIGNvbnZlcnNpb25SYXRlOiAwLjA3ODAsXG4gICAgICAgICAgICBhdmdDb3N0OiAxMS44LFxuICAgICAgICAgICAgcm9pOiAyLjVcbiAgICAgICAgICB9LFxuICAgICAgICAgIHtcbiAgICAgICAgICAgIHBsYXRmb3JtOiAnXHU3RjhFXHU1NkUyJyxcbiAgICAgICAgICAgIHRvdGFsU2FtcGxlczogMjkwMCxcbiAgICAgICAgICAgIHZhbGlkU2FtcGxlczogMjg1MCxcbiAgICAgICAgICAgIGNvbnZlcnNpb25SYXRlOiAwLjA4NjUsXG4gICAgICAgICAgICBhdmdDb3N0OiAxMy4xLFxuICAgICAgICAgICAgcm9pOiAyLjJcbiAgICAgICAgICB9XG4gICAgICAgIF1cbiAgICAgIH0sXG4gICAgICBcbiAgICAgIC8vIFx1NTE3M1x1OTUyRVx1NjMwN1x1NjgwN1x1NkM0N1x1NjAzQlxuICAgICAga2V5TWV0cmljczoge1xuICAgICAgICB0b3RhbEltcHJlc3Npb25zOiAxMjUwMDAwLFxuICAgICAgICB0b3RhbENsaWNrczogOTg1MDAsXG4gICAgICAgIHRvdGFsQ29udmVyc2lvbnM6IDg0MjAsXG4gICAgICAgIG92ZXJhbGxDVFI6IDAuMDc4OCxcbiAgICAgICAgb3ZlcmFsbENWUjogMC4wODU1LFxuICAgICAgICB0b3RhbENvc3Q6IDE1Njc4MCxcbiAgICAgICAgYXZnQ1BDOiAxLjU5LFxuICAgICAgICBhdmdDUEE6IDE4LjYyXG4gICAgICB9LFxuICAgICAgXG4gICAgICAvLyBcdTY1RjZcdTk1RjRcdThEOEJcdTUyQkZcdTY1NzBcdTYzNkVcbiAgICAgIHRpbWVUcmVuZDoge1xuICAgICAgICBkYWlseTogQXJyYXkuZnJvbSh7IGxlbmd0aDogMzAgfSwgKF8sIGkpID0+ICh7XG4gICAgICAgICAgZGF0ZTogbmV3IERhdGUoMjAyNCwgMTAsIGkgKyAxKS50b0lTT1N0cmluZygpLnNwbGl0KCdUJylbMF0sXG4gICAgICAgICAgaW1wcmVzc2lvbnM6IE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIDUwMDAwKSArIDMwMDAwLFxuICAgICAgICAgIGNsaWNrczogTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogNDAwMCkgKyAyMDAwLFxuICAgICAgICAgIGNvbnZlcnNpb25zOiBNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiA0MDApICsgMjAwLFxuICAgICAgICAgIGNvc3Q6IE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIDgwMDApICsgNDAwMFxuICAgICAgICB9KSksXG4gICAgICAgIGhvdXJseTogQXJyYXkuZnJvbSh7IGxlbmd0aDogMjQgfSwgKF8sIGkpID0+ICh7XG4gICAgICAgICAgaG91cjogaSxcbiAgICAgICAgICBpbXByZXNzaW9uczogTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogNTAwMCkgKyAyMDAwLFxuICAgICAgICAgIGNsaWNrczogTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogNDAwKSArIDEwMCxcbiAgICAgICAgICBjb252ZXJzaW9uczogTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogNDApICsgMTAsXG4gICAgICAgICAgY29zdDogTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogODAwKSArIDIwMFxuICAgICAgICB9KSlcbiAgICAgIH0sXG4gICAgICBcbiAgICAgIC8vIFx1NTIwNlx1Njc5MFx1NkQ0MVx1N0EwQlx1NkI2NVx1OUFBNFxuICAgICAgYW5hbHlzaXNTdGVwczogW1xuICAgICAgICB7XG4gICAgICAgICAgc3RlcDogMSxcbiAgICAgICAgICBuYW1lOiAnXHU2NTcwXHU2MzZFXHU5ODg0XHU1OTA0XHU3NDA2JyxcbiAgICAgICAgICBzdGF0dXM6ICdjb21wbGV0ZWQnLFxuICAgICAgICAgIHN0YXJ0VGltZTogJzIwMjQtMTItMDQgMTA6MDA6MDAnLFxuICAgICAgICAgIGVuZFRpbWU6ICcyMDI0LTEyLTA0IDEwOjE1OjAwJyxcbiAgICAgICAgICBkdXJhdGlvbjogJzE1XHU1MjA2XHU5NDlGJyxcbiAgICAgICAgICBkZXNjcmlwdGlvbjogJ1x1NkUwNVx1NkQxN1x1NTQ4Q1x1NjgwN1x1NTFDNlx1NTMxNlx1NTM5Rlx1NTlDQlx1NjU3MFx1NjM2RSdcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIHN0ZXA6IDIsXG4gICAgICAgICAgbmFtZTogJ1x1NjgzN1x1NjcyQ1x1NTMzOVx1OTE0RCcsXG4gICAgICAgICAgc3RhdHVzOiAnY29tcGxldGVkJyxcbiAgICAgICAgICBzdGFydFRpbWU6ICcyMDI0LTEyLTA0IDEwOjE1OjAwJyxcbiAgICAgICAgICBlbmRUaW1lOiAnMjAyNC0xMi0wNCAxMDo0NTowMCcsXG4gICAgICAgICAgZHVyYXRpb246ICczMFx1NTIwNlx1OTQ5RicsXG4gICAgICAgICAgZGVzY3JpcHRpb246ICdcdTUzMzlcdTkxNERcdTVCOUVcdTlBOENcdTdFQzRcdTU0OENcdTVCRjlcdTcxNjdcdTdFQzRcdTY4MzdcdTY3MkMnXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBzdGVwOiAzLFxuICAgICAgICAgIG5hbWU6ICdcdTcyNzlcdTVGODFcdTVERTVcdTdBMEInLFxuICAgICAgICAgIHN0YXR1czogJ2NvbXBsZXRlZCcsXG4gICAgICAgICAgc3RhcnRUaW1lOiAnMjAyNC0xMi0wNCAxMDo0NTowMCcsXG4gICAgICAgICAgZW5kVGltZTogJzIwMjQtMTItMDQgMTE6MzA6MDAnLFxuICAgICAgICAgIGR1cmF0aW9uOiAnNDVcdTUyMDZcdTk0OUYnLFxuICAgICAgICAgIGRlc2NyaXB0aW9uOiAnXHU2Nzg0XHU1RUZBXHU1MjA2XHU2NzkwXHU2MjQwXHU5NzAwXHU3Njg0XHU3Mjc5XHU1RjgxXHU1M0Q4XHU5MUNGJ1xuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgc3RlcDogNCxcbiAgICAgICAgICBuYW1lOiAnXHU2NTQ4XHU2NzlDXHU4QkExXHU3Qjk3JyxcbiAgICAgICAgICBzdGF0dXM6IHN0YXR1cyA9PT0gJ2NvbXBsZXRlZCcgPyAnY29tcGxldGVkJyA6ICdwcm9jZXNzaW5nJyxcbiAgICAgICAgICBzdGFydFRpbWU6ICcyMDI0LTEyLTA0IDExOjMwOjAwJyxcbiAgICAgICAgICBlbmRUaW1lOiBzdGF0dXMgPT09ICdjb21wbGV0ZWQnID8gJzIwMjQtMTItMDQgMTI6MTU6MDAnIDogbnVsbCxcbiAgICAgICAgICBkdXJhdGlvbjogc3RhdHVzID09PSAnY29tcGxldGVkJyA/ICc0NVx1NTIwNlx1OTQ5RicgOiBudWxsLFxuICAgICAgICAgIGRlc2NyaXB0aW9uOiAnXHU4QkExXHU3Qjk3XHU1NDA0XHU5ODc5XHU2NTQ4XHU2NzlDXHU2MzA3XHU2ODA3J1xuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgc3RlcDogNSxcbiAgICAgICAgICBuYW1lOiAnXHU3RURGXHU4QkExXHU2OEMwXHU5QThDJyxcbiAgICAgICAgICBzdGF0dXM6IHN0YXR1cyA9PT0gJ2NvbXBsZXRlZCcgPyAnY29tcGxldGVkJyA6ICdwZW5kaW5nJyxcbiAgICAgICAgICBzdGFydFRpbWU6IHN0YXR1cyA9PT0gJ2NvbXBsZXRlZCcgPyAnMjAyNC0xMi0wNCAxMjoxNTowMCcgOiBudWxsLFxuICAgICAgICAgIGVuZFRpbWU6IHN0YXR1cyA9PT0gJ2NvbXBsZXRlZCcgPyAnMjAyNC0xMi0wNCAxMjo0NTowMCcgOiBudWxsLFxuICAgICAgICAgIGR1cmF0aW9uOiBzdGF0dXMgPT09ICdjb21wbGV0ZWQnID8gJzMwXHU1MjA2XHU5NDlGJyA6IG51bGwsXG4gICAgICAgICAgZGVzY3JpcHRpb246ICdcdThGREJcdTg4NENcdTdFREZcdThCQTFcdTY2M0VcdTg0NTdcdTYwMjdcdTY4QzBcdTlBOEMnXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBzdGVwOiA2LFxuICAgICAgICAgIG5hbWU6ICdcdTUyMDZcdTVFNzNcdTUzRjBcdTUyMDZcdTY3OTAnLFxuICAgICAgICAgIHN0YXR1czogc3RhdHVzID09PSAnY29tcGxldGVkJyA/ICdjb21wbGV0ZWQnIDogJ3BlbmRpbmcnLFxuICAgICAgICAgIHN0YXJ0VGltZTogc3RhdHVzID09PSAnY29tcGxldGVkJyA/ICcyMDI0LTEyLTA0IDEyOjQ1OjAwJyA6IG51bGwsXG4gICAgICAgICAgZW5kVGltZTogc3RhdHVzID09PSAnY29tcGxldGVkJyA/ICcyMDI0LTEyLTA0IDEzOjMwOjAwJyA6IG51bGwsXG4gICAgICAgICAgZHVyYXRpb246IHN0YXR1cyA9PT0gJ2NvbXBsZXRlZCcgPyAnNDVcdTUyMDZcdTk0OUYnIDogbnVsbCxcbiAgICAgICAgICBkZXNjcmlwdGlvbjogJ1x1NTIwNlx1Njc5MFx1NTQwNFx1NUU3M1x1NTNGMFx1NzY4NFx1NjU0OFx1Njc5Q1x1NURFRVx1NUYwMidcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIHN0ZXA6IDcsXG4gICAgICAgICAgbmFtZTogJ1x1OEQ4Qlx1NTJCRlx1NTIwNlx1Njc5MCcsXG4gICAgICAgICAgc3RhdHVzOiBzdGF0dXMgPT09ICdjb21wbGV0ZWQnID8gJ2NvbXBsZXRlZCcgOiAncGVuZGluZycsXG4gICAgICAgICAgc3RhcnRUaW1lOiBzdGF0dXMgPT09ICdjb21wbGV0ZWQnID8gJzIwMjQtMTItMDQgMTM6MzA6MDAnIDogbnVsbCxcbiAgICAgICAgICBlbmRUaW1lOiBzdGF0dXMgPT09ICdjb21wbGV0ZWQnID8gJzIwMjQtMTItMDQgMTQ6MDA6MDAnIDogbnVsbCxcbiAgICAgICAgICBkdXJhdGlvbjogc3RhdHVzID09PSAnY29tcGxldGVkJyA/ICczMFx1NTIwNlx1OTQ5RicgOiBudWxsLFxuICAgICAgICAgIGRlc2NyaXB0aW9uOiAnXHU1MjA2XHU2NzkwXHU2NUY2XHU5NUY0XHU4RDhCXHU1MkJGXHU1NDhDXHU1NDY4XHU2NzFGXHU2MDI3XHU4OUM0XHU1RjhCJ1xuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgc3RlcDogOCxcbiAgICAgICAgICBuYW1lOiAnXHU2MkE1XHU1NDRBXHU3NTFGXHU2MjEwJyxcbiAgICAgICAgICBzdGF0dXM6IHN0YXR1cyA9PT0gJ2NvbXBsZXRlZCcgPyAnY29tcGxldGVkJyA6ICdwZW5kaW5nJyxcbiAgICAgICAgICBzdGFydFRpbWU6IHN0YXR1cyA9PT0gJ2NvbXBsZXRlZCcgPyAnMjAyNC0xMi0wNCAxNDowMDowMCcgOiBudWxsLFxuICAgICAgICAgIGVuZFRpbWU6IHN0YXR1cyA9PT0gJ2NvbXBsZXRlZCcgPyAnMjAyNC0xMi0wNCAxNDoxNTowMCcgOiBudWxsLFxuICAgICAgICAgIGR1cmF0aW9uOiBzdGF0dXMgPT09ICdjb21wbGV0ZWQnID8gJzE1XHU1MjA2XHU5NDlGJyA6IG51bGwsXG4gICAgICAgICAgZGVzY3JpcHRpb246ICdcdTc1MUZcdTYyMTBcdTY3MDBcdTdFQzhcdTUyMDZcdTY3OTBcdTYyQTVcdTU0NEEnXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBzdGVwOiA5LFxuICAgICAgICAgIG5hbWU6ICdcdThEMjhcdTkxQ0ZcdTY4QzBcdTY3RTUnLFxuICAgICAgICAgIHN0YXR1czogc3RhdHVzID09PSAnY29tcGxldGVkJyA/ICdjb21wbGV0ZWQnIDogJ3BlbmRpbmcnLFxuICAgICAgICAgIHN0YXJ0VGltZTogc3RhdHVzID09PSAnY29tcGxldGVkJyA/ICcyMDI0LTEyLTA0IDE0OjE1OjAwJyA6IG51bGwsXG4gICAgICAgICAgZW5kVGltZTogc3RhdHVzID09PSAnY29tcGxldGVkJyA/ICcyMDI0LTEyLTA0IDE0OjIwOjAwJyA6IG51bGwsXG4gICAgICAgICAgZHVyYXRpb246IHN0YXR1cyA9PT0gJ2NvbXBsZXRlZCcgPyAnNVx1NTIwNlx1OTQ5RicgOiBudWxsLFxuICAgICAgICAgIGRlc2NyaXB0aW9uOiAnXHU2OEMwXHU2N0U1XHU2MkE1XHU1NDRBXHU4RDI4XHU5MUNGXHU1NDhDXHU1QjhDXHU2NTc0XHU2MDI3J1xuICAgICAgICB9XG4gICAgICBdXG4gICAgfTtcbiAgfVxuICBcbiAgcmV0dXJuIGJhc2VEYXRhO1xufTtcblxuLy8gXHU3NTFGXHU2MjEwXHU1REYyXHU2Q0U4XHU1MThDXHU3Njg0XHU1OTE2XHU2NTcwXHU0RUE3XHU1NEMxXHU1MjE3XHU4ODY4XG5jb25zdCBnZW5lcmF0ZVJlZ2lzdGVyZWRQcm9kdWN0cyA9ICgpID0+IHtcbiAgY29uc3QgbWFudWFsUHJvZHVjdHMgPSBbXG4gICAge1xuICAgICAgaWQ6ICdFWFQwMDEnLFxuICAgICAgbmFtZTogJ1x1NEUyQVx1NEVCQVx1OEVBQlx1NEVGRFx1NjgzOFx1OUE4Q1x1NjcwRFx1NTJBMScsXG4gICAgICBjb2RlOiAnUElELUlERU5USVRZLVZFUklGWScsXG4gICAgICBzdXBwbGllcjogJ1x1NUI2Nlx1NEZFMVx1N0Y1MScsIC8vIFx1NEZFRVx1NkI2M1x1NEUzQVx1NUI2Nlx1NEZFMVx1N0Y1MVxuICAgICAgcHJvdmlkZXI6ICdcdTVCNjZcdTRGRTFcdTdGNTEnLFxuICAgICAgY2hhbm5lbElkOiAnQ0gtMDAxJyxcbiAgICAgIGNoYW5uZWxOYW1lOiAnXHU1QjY2XHU0RkUxXHU3RjUxJyxcbiAgICAgIGNhdGVnb3J5OiAnXHU2ODM4XHU5QThDXHU3QzdCJyxcbiAgICAgIHN0YXR1czogJ29ubGluZScsXG4gICAgICBpbnRlcmZhY2VzOiAyLFxuICAgICAgYm90dG9tVGFibGU6ICdkd2RfaWRlbnRpdHlfdmVyaWZ5X2RldGFpbCcsXG4gICAgICB1bml0UHJpY2U6IDAuNSxcbiAgICAgIGJpbGxpbmdNb2RlOiAncGVyX2NhbGwnLFxuICAgICAgYmlsbGluZ0N5Y2xlOiAnbW9udGgnLFxuICAgICAgY3VycmVuY3k6ICdDTlknLFxuICAgICAgcmVnaXN0cmF0aW9uRGF0ZTogJzIwMjMtMTItMDEnLFxuICAgICAgbGFzdFVwZGF0ZURhdGU6ICcyMDI1LTEyLTAxJyxcbiAgICAgIHVzYWdlU2NlbmU6ICdcdTZDRThcdTUxOENcdTVCOUVcdTU0MERcdThCQTRcdThCQzEnLFxuICAgICAgdGFnczogWydcdTY4MzhcdTlBOEMnLCdcdThFQUJcdTRFRkQnXSxcbiAgICAgIGRlc2NyaXB0aW9uOiAnXHU2M0QwXHU0RjlCXHU1QjlFXHU2NUY2XHU4RUFCXHU0RUZEXHU0RkUxXHU2MDZGXHU2ODM4XHU5QThDXHU2NzBEXHU1MkExXHVGRjBDXHU2NTJGXHU2MzAxXHU1OUQzXHU1NDBEXHUzMDAxXHU4RUFCXHU0RUZEXHU4QkMxXHU1M0Y3XHUzMDAxXHU2MjRCXHU2NzNBXHU1M0Y3XHU0RTA5XHU4OTgxXHU3RDIwXHU2MjE2XHU0RThDXHU4OTgxXHU3RDIwXHU3Njg0XHU2ODM4XHU5QThDJ1xuICAgIH0sXG4gICAge1xuICAgICAgaWQ6ICdFWFQwMDInLFxuICAgICAgbmFtZTogJ1x1NEYwMVx1NEUxQVx1NEZFMVx1NzUyOFx1OEJDNFx1NTIwNlx1NjcwRFx1NTJBMScsXG4gICAgICBjb2RlOiAnUElELUVOVEVSUFJJU0UtQ1JFRElUJyxcbiAgICAgIHN1cHBsaWVyOiAnXHU3NjdFXHU4ODRDJywgLy8gXHU0RkVFXHU2QjYzXHU0RTNBXHU3NjdFXHU4ODRDXHVGRjBDXHU1ODlFXHU1MkEwXHU1OTFBXHU2ODM3XHU2MDI3XG4gICAgICBwcm92aWRlcjogJ1x1NzY3RVx1ODg0Q1x1NUY4MVx1NEZFMScsXG4gICAgICBjaGFubmVsSWQ6ICdDSC0wMDInLFxuICAgICAgY2hhbm5lbE5hbWU6ICdcdTc2N0VcdTg4NENcdTVGODFcdTRGRTEnLFxuICAgICAgY2F0ZWdvcnk6ICdcdThCQzRcdTUyMDZcdTdDN0InLFxuICAgICAgc3RhdHVzOiAnb25saW5lJyxcbiAgICAgIGludGVyZmFjZXM6IDEsXG4gICAgICBib3R0b21UYWJsZTogJ2R3ZF9lbnRlcnByaXNlX2NyZWRpdF9kZXRhaWwnLFxuICAgICAgdW5pdFByaWNlOiAyMCxcbiAgICAgIGJpbGxpbmdNb2RlOiAncGVyX2NhbGwnLFxuICAgICAgYmlsbGluZ0N5Y2xlOiAnbW9udGgnLFxuICAgICAgY3VycmVuY3k6ICdDTlknLFxuICAgICAgcmVnaXN0cmF0aW9uRGF0ZTogJzIwMjMtMTEtMTUnLFxuICAgICAgbGFzdFVwZGF0ZURhdGU6ICcyMDI1LTEyLTAxJyxcbiAgICAgIHVzYWdlU2NlbmU6ICdcdThEMzdcdTUyNERcdTYzODhcdTRGRTFcdThCQzRcdTRGMzAnLFxuICAgICAgdGFnczogWydcdThCQzRcdTUyMDYnLCdcdTVGODFcdTRGRTEnXSxcbiAgICAgIGRlc2NyaXB0aW9uOiAnXHU0RjAxXHU0RTFBXHU1OTFBXHU3RUY0XHU1RUE2XHU0RkUxXHU3NTI4XHU5OENFXHU5NjY5XHU4QkM0XHU1MjA2XHU2NzBEXHU1MkExXHVGRjBDXHU5MDAyXHU3NTI4XHU0RThFXHU0RjAxXHU0RTFBXHU2Mzg4XHU0RkUxXHUzMDAxXHU4RDM3XHU1MjREXHU1QkExXHU2N0U1XHU3QjQ5XHU1NzNBXHU2NjZGJ1xuICAgIH0sXG4gICAge1xuICAgICAgaWQ6ICdFWFQwMDMnLFxuICAgICAgbmFtZTogJ1x1OEJCRVx1NTkwN1x1NjMwN1x1N0VCOVx1OThDRVx1OTY2OVx1OEJDNlx1NTIyQicsXG4gICAgICBjb2RlOiAnUElELURFVklDRS1GUCcsXG4gICAgICBzdXBwbGllcjogJ1x1OTRCMVx1NTg1OCcsIC8vIFx1NEZFRVx1NkI2M1x1NEUzQVx1OTRCMVx1NTg1OFxuICAgICAgcHJvdmlkZXI6ICdcdTk0QjFcdTU4NThcdTVGODFcdTRGRTEnLFxuICAgICAgY2hhbm5lbElkOiAnQ0gtMDAzJyxcbiAgICAgIGNoYW5uZWxOYW1lOiAnXHU5NEIxXHU1ODU4XHU1RjgxXHU0RkUxJyxcbiAgICAgIGNhdGVnb3J5OiAnXHU1M0NEXHU2QjNBXHU4QkM4JyxcbiAgICAgIHN0YXR1czogJ2ltcG9ydGluZycsXG4gICAgICBpbnRlcmZhY2VzOiAxLFxuICAgICAgYm90dG9tVGFibGU6ICdkd2RfZGV2aWNlX2ZpbmdlcnByaW50JyxcbiAgICAgIHVuaXRQcmljZTogMC4yLFxuICAgICAgYmlsbGluZ01vZGU6ICdwZXJfY2FsbCcsXG4gICAgICBiaWxsaW5nQ3ljbGU6ICdtb250aCcsXG4gICAgICBjdXJyZW5jeTogJ0NOWScsXG4gICAgICByZWdpc3RyYXRpb25EYXRlOiAnMjAyNS0xMS0wMScsXG4gICAgICBsYXN0VXBkYXRlRGF0ZTogJzIwMjUtMTItMDEnLFxuICAgICAgdXNhZ2VTY2VuZTogJ1x1NzY3Qlx1NUY1NVx1NEUwRVx1NEVBNFx1NjYxM1x1OThDRVx1NjNBNycsXG4gICAgICB0YWdzOiBbJ1x1OEJCRVx1NTkwNycsJ1x1OThDRVx1NjNBNyddLFxuICAgICAgZGVzY3JpcHRpb246ICdcdThCQkVcdTU5MDdcdTYzMDdcdTdFQjlcdThCQzZcdTUyMkJcdTRFMEVcdTk4Q0VcdTk2NjlcdTY4MDdcdTZDRThcdUZGMENcdTY1MkZcdTYzMDFcdTUzQ0RcdTgxRUFcdTUyQThcdTUzMTZcdTRFMEVcdThEMjZcdTUzRjdcdTVCODlcdTUxNjhcdTU3M0FcdTY2NkYnXG4gICAgfVxuICBdO1xuXG4gIGNvbnN0IHN1cHBsaWVyTWFwOiBSZWNvcmQ8c3RyaW5nLCBzdHJpbmc+ID0ge1xuICAgICdTVVAtMDAxJzogJ1x1NUI2Nlx1NEZFMVx1N0Y1MScsIC8vIFx1NEZFRVx1NkI2M1x1RkYxQVNVUC0wMDEgXHU1RTk0XHU2NjIwXHU1QzA0XHU0RTNBXHU1QjY2XHU0RkUxXHU3RjUxXHVGRjBDXHU0RTBFIENvbnRyYWN0Q3JlYXRlIFx1NTE1Q1x1NUU5NVx1OTAzQlx1OEY5MVx1NEUwMFx1ODFGNFxuICAgICdTVVAtMDAyJzogJ1x1ODE3RVx1OEJBRicsXG4gICAgJ1NVUC0wMDMnOiAnXHU3NjdFXHU1RUE2JyxcbiAgICAnU1VQLTAwNCc6ICdcdTlBRDhcdTVGQjcnXG4gIH07XG5cbiAgY29uc3QgbWFwcGVkUHJvZHVjdHMgPSBzdXBwbGllclByb2R1Y3RzTW9jay5tYXAocCA9PiAoe1xuICAgIGlkOiBwLnByb2R1Y3RJZCxcbiAgICBuYW1lOiBwLnByb2R1Y3ROYW1lLFxuICAgIGNvZGU6IHAucHJvZHVjdENvZGUsXG4gICAgc3VwcGxpZXI6IHN1cHBsaWVyTWFwW3Auc3VwcGxpZXJJZF0gfHwgcC5zdXBwbGllcklkLFxuICAgIHByb3ZpZGVyOiBzdXBwbGllck1hcFtwLnN1cHBsaWVySWRdIHx8IHAuc3VwcGxpZXJJZCxcbiAgICBjaGFubmVsSWQ6IHAuc3VwcGxpZXJJZCxcbiAgICBjaGFubmVsTmFtZTogc3VwcGxpZXJNYXBbcC5zdXBwbGllcklkXSB8fCBwLnN1cHBsaWVySWQsXG4gICAgY2F0ZWdvcnk6IHAuY2F0ZWdvcnkgPT09ICdTUEVDSUFMJyA/ICdcdTcyNzlcdTZCOEEnIDogJ1x1NjU3MFx1NjM2RScsXG4gICAgc3RhdHVzOiAnb25saW5lJyxcbiAgICBpbnRlcmZhY2VzOiBwLmludGVyZmFjZUNvdW50LFxuICAgIGJvdHRvbVRhYmxlOiBgZHdkXyR7cC5wcm9kdWN0Q29kZS50b0xvd2VyQ2FzZSgpLnJlcGxhY2UoLy0vZywgJ18nKX1fZGV0YWlsYCxcbiAgICB1bml0UHJpY2U6IDEuMCxcbiAgICBiaWxsaW5nTW9kZTogJ3Blcl9jYWxsJyxcbiAgICBiaWxsaW5nQ3ljbGU6ICdtb250aCcsXG4gICAgY3VycmVuY3k6ICdDTlknLFxuICAgIHJlZ2lzdHJhdGlvbkRhdGU6IHAuY3JlYXRlZEF0LnNwbGl0KCdUJylbMF0sXG4gICAgbGFzdFVwZGF0ZURhdGU6IHAudXBkYXRlZEF0LnNwbGl0KCdUJylbMF0sXG4gICAgdXNhZ2VTY2VuZTogJ1x1OTAxQVx1NzUyOFx1NTczQVx1NjY2RicsXG4gICAgdGFnczogWydcdTU5MTZcdTY1NzAnLCBwLmNhdGVnb3J5XSxcbiAgICBkZXNjcmlwdGlvbjogYCR7cC5wcm9kdWN0TmFtZX0gLSBcdTc1MzEke3N1cHBsaWVyTWFwW3Auc3VwcGxpZXJJZF0gfHwgcC5zdXBwbGllcklkfVx1NjNEMFx1NEY5QmBcbiAgfSkpO1xuXG4gIHJldHVybiBbLi4ubWFudWFsUHJvZHVjdHMsIC4uLm1hcHBlZFByb2R1Y3RzXTtcbn07XG5cbmV4cG9ydCBkZWZhdWx0IFtcbiAgLy8gXHU2QTIxXHU2MkRGXHU1OTE2XHU5MEU4XHU2NTcwXHU2MzZFXHU4QkM0XHU0RjMwXHU2MkE1XHU1NDRBXHU1MjE3XHU4ODY4QVBJXG4gIHtcbiAgICB1cmw6ICcvYXBpL2V4dGVybmFsLWRhdGEtZXZhbHVhdGlvbi9saXN0JyxcbiAgICBtZXRob2Q6ICdnZXQnLFxuICAgIHJlc3BvbnNlOiAoeyBxdWVyeSB9OiB7IHF1ZXJ5OiBhbnkgfSkgPT4ge1xuICAgICAgY29uc3QgeyBcbiAgICAgICAgY3VycmVudCA9IDEsIFxuICAgICAgICBwYWdlU2l6ZSA9IDEwLCBcbiAgICAgICAgcmVwb3J0TmFtZSwgXG4gICAgICAgIHN0YXR1cywgXG4gICAgICAgIHN0YXJ0RGF0ZSwgXG4gICAgICAgIGVuZERhdGUgXG4gICAgICB9ID0gcXVlcnk7XG4gICAgICBcbiAgICAgIGxldCByZXBvcnRzID0gZ2VuZXJhdGVFdmFsdWF0aW9uUmVwb3J0cyg1MCk7XG4gICAgICBcbiAgICAgIC8vIFx1OEZDN1x1NkVFNFx1Njc2MVx1NEVGNlxuICAgICAgaWYgKHJlcG9ydE5hbWUpIHtcbiAgICAgICAgcmVwb3J0cyA9IHJlcG9ydHMuZmlsdGVyKHJlcG9ydCA9PiBcbiAgICAgICAgICByZXBvcnQucmVwb3J0TmFtZS50b0xvd2VyQ2FzZSgpLmluY2x1ZGVzKHJlcG9ydE5hbWUudG9Mb3dlckNhc2UoKSlcbiAgICAgICAgKTtcbiAgICAgIH1cbiAgICAgIFxuICAgICAgaWYgKHN0YXR1cykge1xuICAgICAgICByZXBvcnRzID0gcmVwb3J0cy5maWx0ZXIocmVwb3J0ID0+IHJlcG9ydC5zdGF0dXMgPT09IHN0YXR1cyk7XG4gICAgICB9XG4gICAgICBcbiAgICAgIGlmIChzdGFydERhdGUpIHtcbiAgICAgICAgcmVwb3J0cyA9IHJlcG9ydHMuZmlsdGVyKHJlcG9ydCA9PiByZXBvcnQuZ2VuZXJhdGVEYXRlID49IHN0YXJ0RGF0ZSk7XG4gICAgICB9XG4gICAgICBcbiAgICAgIGlmIChlbmREYXRlKSB7XG4gICAgICAgIHJlcG9ydHMgPSByZXBvcnRzLmZpbHRlcihyZXBvcnQgPT4gcmVwb3J0LmdlbmVyYXRlRGF0ZSA8PSBlbmREYXRlKTtcbiAgICAgIH1cbiAgICAgIFxuICAgICAgLy8gXHU1MjA2XHU5ODc1XG4gICAgICBjb25zdCBzdGFydCA9IChjdXJyZW50IC0gMSkgKiBwYWdlU2l6ZTtcbiAgICAgIGNvbnN0IGVuZCA9IHN0YXJ0ICsgcGFnZVNpemU7XG4gICAgICBjb25zdCBwYWdpbmF0ZWRSZXBvcnRzID0gcmVwb3J0cy5zbGljZShzdGFydCwgZW5kKTtcbiAgICAgIFxuICAgICAgcmV0dXJuIHtcbiAgICAgICAgY29kZTogMjAwLFxuICAgICAgICBtZXNzYWdlOiAnc3VjY2VzcycsXG4gICAgICAgIGRhdGE6IHtcbiAgICAgICAgICBsaXN0OiBwYWdpbmF0ZWRSZXBvcnRzLFxuICAgICAgICAgIHRvdGFsOiByZXBvcnRzLmxlbmd0aCxcbiAgICAgICAgICBjdXJyZW50OiBwYXJzZUludChjdXJyZW50KSxcbiAgICAgICAgICBwYWdlU2l6ZTogcGFyc2VJbnQocGFnZVNpemUpXG4gICAgICAgIH1cbiAgICAgIH07XG4gICAgfVxuICB9LFxuICBcbiAgLy8gXHU2QTIxXHU2MkRGXHU1OTE2XHU5MEU4XHU2NTcwXHU2MzZFXHU4QkM0XHU0RjMwXHU2MkE1XHU1NDRBXHU4QkU2XHU2MEM1QVBJXG4gIHtcbiAgICB1cmw6ICcvYXBpL2V4dGVybmFsLWRhdGEtZXZhbHVhdGlvbi9kZXRhaWwvOmlkJyxcbiAgICBtZXRob2Q6ICdnZXQnLFxuICAgIHJlc3BvbnNlOiAoeyB1cmwgfTogeyB1cmw6IHN0cmluZyB9KSA9PiB7XG4gICAgICBjb25zdCBpZCA9IHVybC5zcGxpdCgnLycpLnBvcCgpO1xuICAgICAgaWYgKCFpZCkge1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgIGNvZGU6IDQwMCxcbiAgICAgICAgICBtZXNzYWdlOiAnXHU3RjNBXHU1QzExXHU2MkE1XHU1NDRBSUQnLFxuICAgICAgICAgIGRhdGE6IG51bGxcbiAgICAgICAgfTtcbiAgICAgIH1cbiAgICAgIFxuICAgICAgY29uc3QgcmVwb3J0RGV0YWlsID0gZ2VuZXJhdGVFdmFsdWF0aW9uUmVwb3J0RGV0YWlsKGlkKTtcbiAgICAgIFxuICAgICAgcmV0dXJuIHtcbiAgICAgICAgY29kZTogMjAwLFxuICAgICAgICBtZXNzYWdlOiAnc3VjY2VzcycsXG4gICAgICAgIGRhdGE6IHJlcG9ydERldGFpbFxuICAgICAgfTtcbiAgICB9XG4gIH0sXG4gIFxuICAvLyBcdTZBMjFcdTYyREZcdTUyMUJcdTVFRkFcdTU5MTZcdTkwRThcdTY1NzBcdTYzNkVcdThCQzRcdTRGMzBcdTYyQTVcdTU0NEFBUElcbiAge1xuICAgIHVybDogJy9hcGkvZXh0ZXJuYWwtZGF0YS1ldmFsdWF0aW9uL2NyZWF0ZScsXG4gICAgbWV0aG9kOiAncG9zdCcsXG4gICAgcmVzcG9uc2U6ICh7IGJvZHkgfTogeyBib2R5OiBhbnkgfSkgPT4ge1xuICAgICAgY29uc3QgeyB0aXRsZSwgdHlwZSwgc3RhdHVzLCBzY29yZSwgcmVwb3J0TmFtZSwgcmVwb3J0VHlwZSwgYW5hbHlzaXNUeXBlLCBzYW1wbGVGaWxlcyB9ID0gYm9keTtcbiAgICAgIFxuICAgICAgLy8gXHU1MTdDXHU1QkI5XHU0RTI0XHU3OUNEXHU2NTcwXHU2MzZFXHU3RUQzXHU2Nzg0XHVGRjFBXHU2NUIwXHU3MjQ4KHRpdGxlL3R5cGUpXHU1NDhDXHU2NUU3XHU3MjQ4KHJlcG9ydE5hbWUvcmVwb3J0VHlwZSlcbiAgICAgIGNvbnN0IG5ld1JlcG9ydCA9IHtcbiAgICAgICAgaWQ6IERhdGUubm93KCksXG4gICAgICAgIHRpdGxlOiB0aXRsZSB8fCByZXBvcnROYW1lIHx8IGBcdThCQzRcdTRGMzAtJHtEYXRlLm5vdygpfWAsXG4gICAgICAgIHR5cGU6IHR5cGUgfHwgcmVwb3J0VHlwZSB8fCAnY29tcHJlaGVuc2l2ZScsXG4gICAgICAgIHJlcG9ydFR5cGU6IHR5cGUgfHwgcmVwb3J0VHlwZSB8fCAnY29tcHJlaGVuc2l2ZScsXG4gICAgICAgIHN0YXR1czogc3RhdHVzIHx8ICdkcmFmdCcsXG4gICAgICAgIHNjb3JlOiBzY29yZSA/PyAwLFxuICAgICAgICBjcmVhdGVkQXQ6IG5ldyBEYXRlKCkudG9JU09TdHJpbmcoKSxcbiAgICAgICAgLy8gXHU2NUU3XHU3MjQ4XHU1QjU3XHU2QkI1XHVGRjA4XHU0RkREXHU2MzAxXHU1MTdDXHU1QkI5XHU2MDI3XHVGRjA5XG4gICAgICAgIHJlcG9ydE5hbWU6IHRpdGxlIHx8IHJlcG9ydE5hbWUsXG4gICAgICAgIGFuYWx5c2lzVHlwZTogYW5hbHlzaXNUeXBlIHx8IHR5cGUsXG4gICAgICAgIGdlbmVyYXRlRGF0ZTogbmV3IERhdGUoKS50b0lTT1N0cmluZygpLnNwbGl0KCdUJylbMF0sXG4gICAgICAgIHByb2dyZXNzOiAwLFxuICAgICAgICBzYW1wbGVUaW1lU3BhbjogJycsXG4gICAgICAgIHRlbXBsYXRlVHlwZTogJ1x1NjgwN1x1NTFDNlx1NkEyMVx1Njc3RicsXG4gICAgICAgIGFuYWx5c2lzVGltZTogbnVsbCxcbiAgICAgICAgZmFpbHVyZVJlYXNvbjogbnVsbCxcbiAgICAgICAgc2FtcGxlRmlsZXM6IHNhbXBsZUZpbGVzIHx8IFtdXG4gICAgICB9O1xuICAgICAgXG4gICAgICByZXR1cm4ge1xuICAgICAgICBjb2RlOiAyMDAsXG4gICAgICAgIG1lc3NhZ2U6ICdcdTYyQTVcdTU0NEFcdTUyMUJcdTVFRkFcdTYyMTBcdTUyOUYnLFxuICAgICAgICBkYXRhOiBuZXdSZXBvcnRcbiAgICAgIH07XG4gICAgfVxuICB9LFxuICBcbiAgLy8gXHU2QTIxXHU2MkRGXHU4M0I3XHU1M0Q2XHU1REYyXHU2Q0U4XHU1MThDXHU3Njg0XHU1OTE2XHU2NTcwXHU0RUE3XHU1NEMxXHU1MjE3XHU4ODY4QVBJXG4gIHtcbiAgICB1cmw6ICcvYXBpL2V4dGVybmFsLWRhdGEtZXZhbHVhdGlvbi9wcm9kdWN0cycsXG4gICAgbWV0aG9kOiAnZ2V0JyxcbiAgICByZXNwb25zZTogKCkgPT4ge1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgY29kZTogMjAwLFxuICAgICAgICBtZXNzYWdlOiAnc3VjY2VzcycsXG4gICAgICAgIGRhdGE6IGdlbmVyYXRlUmVnaXN0ZXJlZFByb2R1Y3RzKClcbiAgICAgIH07XG4gICAgfVxuICB9LFxuICBcbiAgLy8gXHU2QTIxXHU2MkRGXHU2NkY0XHU2NUIwXHU1OTE2XHU5MEU4XHU2NTcwXHU2MzZFXHU4QkM0XHU0RjMwXHU2MkE1XHU1NDRBQVBJXG4gIHtcbiAgICB1cmw6ICcvYXBpL2V4dGVybmFsLWRhdGEtZXZhbHVhdGlvbi91cGRhdGUvOmlkJyxcbiAgICBtZXRob2Q6ICdwdXQnLFxuICAgIHJlc3BvbnNlOiAoeyB1cmwsIGJvZHkgfTogeyB1cmw6IHN0cmluZzsgYm9keTogYW55IH0pID0+IHtcbiAgICAgIGNvbnN0IGlkID0gdXJsLnNwbGl0KCcvJykucG9wKCk7XG4gICAgICBpZiAoIWlkKSB7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgY29kZTogNDAwLFxuICAgICAgICAgIG1lc3NhZ2U6ICdcdTdGM0FcdTVDMTFcdTYyQTVcdTU0NEFJRCcsXG4gICAgICAgICAgZGF0YTogbnVsbFxuICAgICAgICB9O1xuICAgICAgfVxuICAgICAgXG4gICAgICAvLyBcdTZBMjFcdTYyREZcdTRGRERcdTVCNThcdTYyMTBcdTUyOUZcbiAgICAgIHJldHVybiB7XG4gICAgICAgIGNvZGU6IDIwMCxcbiAgICAgICAgbWVzc2FnZTogJ1x1NjJBNVx1NTQ0QVx1NEZERFx1NUI1OFx1NjIxMFx1NTI5RicsXG4gICAgICAgIGRhdGE6IHtcbiAgICAgICAgICBpZDogcGFyc2VJbnQoaWQpLFxuICAgICAgICAgIC4uLmJvZHksXG4gICAgICAgICAgbGFzdE1vZGlmaWVkOiBuZXcgRGF0ZSgpLnRvSVNPU3RyaW5nKClcbiAgICAgICAgfVxuICAgICAgfTtcbiAgICB9XG4gIH0sXG4gIFxuICAvLyBcdTZBMjFcdTYyREZcdTUzRDFcdTVFMDNcdTU5MTZcdTkwRThcdTY1NzBcdTYzNkVcdThCQzRcdTRGMzBcdTYyQTVcdTU0NEFBUElcbiAge1xuICAgIHVybDogJy9hcGkvZXh0ZXJuYWwtZGF0YS1ldmFsdWF0aW9uL3B1Ymxpc2gvOmlkJyxcbiAgICBtZXRob2Q6ICdwdXQnLFxuICAgIHJlc3BvbnNlOiAoeyB1cmwsIGJvZHkgfTogeyB1cmw6IHN0cmluZzsgYm9keTogYW55IH0pID0+IHtcbiAgICAgIGNvbnN0IGlkID0gdXJsLnNwbGl0KCcvJykucG9wKCk7XG4gICAgICBpZiAoIWlkKSB7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgY29kZTogNDAwLFxuICAgICAgICAgIG1lc3NhZ2U6ICdcdTdGM0FcdTVDMTFcdTYyQTVcdTU0NEFJRCcsXG4gICAgICAgICAgZGF0YTogbnVsbFxuICAgICAgICB9O1xuICAgICAgfVxuICAgICAgXG4gICAgICAvLyBcdTZBMjFcdTYyREZcdTUzRDFcdTVFMDNcdTYyMTBcdTUyOUZcbiAgICAgIHJldHVybiB7XG4gICAgICAgIGNvZGU6IDIwMCxcbiAgICAgICAgbWVzc2FnZTogJ1x1NjJBNVx1NTQ0QVx1NTNEMVx1NUUwM1x1NjIxMFx1NTI5RicsXG4gICAgICAgIGRhdGE6IHtcbiAgICAgICAgICBpZDogcGFyc2VJbnQoaWQpLFxuICAgICAgICAgIC4uLmJvZHksXG4gICAgICAgICAgc3RhdHVzOiAnXHU1REYyXHU1M0QxXHU1RTAzJyxcbiAgICAgICAgICBwcm9ncmVzczogMTAwLFxuICAgICAgICAgIHB1Ymxpc2hUaW1lOiBuZXcgRGF0ZSgpLnRvSVNPU3RyaW5nKClcbiAgICAgICAgfVxuICAgICAgfTtcbiAgICB9XG4gIH0sXG5cbiAgLy8gXHU2QTIxXHU2MkRGXHU1RjUyXHU2ODYzXHU1OTE2XHU5MEU4XHU2NTcwXHU2MzZFXHU4QkM0XHU0RjMwXHU2MkE1XHU1NDRBQVBJXG4gIHtcbiAgICB1cmw6ICcvYXBpL2V4dGVybmFsLWRhdGEtZXZhbHVhdGlvbi86aWQvYXJjaGl2ZScsXG4gICAgbWV0aG9kOiAncHV0JyxcbiAgICByZXNwb25zZTogKHsgdXJsIH06IHsgdXJsOiBzdHJpbmcgfSkgPT4ge1xuICAgICAgLy8gdXJsIGZvcm1hdDogL2FwaS9leHRlcm5hbC1kYXRhLWV2YWx1YXRpb24vMTIzL2FyY2hpdmVcbiAgICAgIGNvbnN0IHBhcnRzID0gdXJsLnNwbGl0KCcvJyk7XG4gICAgICBjb25zdCBpZCA9IHBhcnRzW3BhcnRzLmxlbmd0aCAtIDJdO1xuICAgICAgaWYgKCFpZCkge1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgIGNvZGU6IDQwMCxcbiAgICAgICAgICBtZXNzYWdlOiAnXHU3RjNBXHU1QzExXHU2MkE1XHU1NDRBSUQnLFxuICAgICAgICAgIGRhdGE6IG51bGxcbiAgICAgICAgfTtcbiAgICAgIH1cbiAgICAgIFxuICAgICAgcmV0dXJuIHtcbiAgICAgICAgY29kZTogMjAwLFxuICAgICAgICBtZXNzYWdlOiAnXHU2MkE1XHU1NDRBXHU1RjUyXHU2ODYzXHU2MjEwXHU1MjlGJyxcbiAgICAgICAgZGF0YToge1xuICAgICAgICAgIGlkOiBwYXJzZUludChpZCksXG4gICAgICAgICAgc3RhdHVzOiAnYXJjaGl2ZWQnXG4gICAgICAgIH1cbiAgICAgIH07XG4gICAgfVxuICB9XG5dIGFzIE1vY2tNZXRob2RbXTtcbiJdLAogICJtYXBwaW5ncyI6ICI7QUFpQkEsSUFBTSxPQUFNLG9CQUFJLEtBQUssR0FBRSxZQUFZO0FBR25DLElBQU0sdUJBQTBDO0FBQUEs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QU07QUFBQSxNQUNOLFVBQVU7QUFBQTtBQUFBLE1BQ1YsVUFBVTtBQUFBLE1BQ1YsV0FBVztBQUFBLE1BQ1gsYUFBYTtBQUFBLE1BQ2IsVUFBVTtBQUFBLE1BQ1YsUUFBUTtBQUFBLE1BQ1IsWUFBWTtBQUFBLE1BQ1osYUFBYTtBQUFBLE1BQ2IsV0FBVztBQUFBLE1BQ1gsYUFBYTtBQUFBLE1BQ2IsY0FBYztBQUFBLE1BQ2QsVUFBVTtBQUFBLE1BQ1Ysa0JBQWtCO0FBQUEsTUFDbEIsZ0JBQWdCO0FBQUEsTUFDaEIsWUFBWTtBQUFBLE1BQ1osTUFBTSxDQUFDLGdCQUFLLGNBQUk7QUFBQSxNQUNoQixhQUFhO0FBQUEsSUFDZjtBQUFBLElBQ0E7QUFBQSxNQUNFLElBQUk7QUFBQSxNQUNKLE1BQU07QUFBQSxNQUNOLE1BQU07QUFBQSxNQUNOLFVBQVU7QUFBQTtBQUFBLE1BQ1YsVUFBVTtBQUFBLE1BQ1YsV0FBVztBQUFBLE1BQ1gsYUFBYTtBQUFBLE1BQ2IsVUFBVTtBQUFBLE1BQ1YsUUFBUTtBQUFBLE1BQ1IsWUFBWTtBQUFBLE1BQ1osYUFBYTtBQUFBLE1BQ2IsV0FBVztBQUFBLE1BQ1gsYUFBYTtBQUFBLE1BQ2IsY0FBYztBQUFBLE1BQ2QsVUFBVTtBQUFBLE1BQ1Ysa0JBQWtCO0FBQUEsTUFDbEIsZ0JBQWdCO0FBQUEsTUFDaEIsWUFBWTtBQUFBLE1BQ1osTUFBTSxDQUFDLGdCQUFLLGNBQUk7QUFBQSxNQUNoQixhQUFhO0FBQUEsSUFDZjtBQUFBLElBQ0E7QUFBQSxNQUNFLElBQUk7QUFBQSxNQUNKLE1BQU07QUFBQSxNQUNOLE1BQU07QUFBQSxNQUNOLFVBQVU7QUFBQTtBQUFBLE1BQ1YsVUFBVTtBQUFBLE1BQ1YsV0FBVztBQUFBLE1BQ1gsYUFBYTtBQUFBLE1BQ2IsVUFBVTtBQUFBLE1BQ1YsUUFBUTtBQUFBLE1BQ1IsWUFBWTtBQUFBLE1BQ1osYUFBYTtBQUFBLE1BQ2IsV0FBVztBQUFBLE1BQ1gsYUFBYTtBQUFBLE1BQ2IsY0FBYztBQUFBLE1BQ2QsVUFBVTtBQUFBLE1BQ1Ysa0JBQWtC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
