/// <reference types="../../../node_modules/.vue-global-types/vue_3.5_0_0_0.d.ts" />
import { ref } from 'vue';
import { IconUpload, IconDownload } from '@arco-design/web-vue/es/icon';
import { useFileUpload, downloadTemplate } from '@/utils/fileUploadUtils';
const incrementalModalVisible = ref(false);
const incrementalFileCount = ref(0);
const { isDragover, uploadProgress, currentFile, handleDragOver, handleDragLeave, handleDrop, formatFileSize, handleFileChange, handleUpload } = useFileUpload();
const showIncrementalModal = () => {
    incrementalModalVisible.value = true;
};
const confirmIncrementalUpload = () => {
    console.log('确认增量上传', incrementalFileCount.value, '条记录');
    console.log('触发增量上传API请求');
    incrementalFileCount.value = 0;
    incrementalModalVisible.value = false;
};
const handleIncrementalUpload = async (option) => {
    return handleUpload(option, '/api/metrics/incremental-import', incrementalFileCount);
};
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
const __VLS_0 = {}.AModal;
/** @type {[typeof __VLS_components.AModal, typeof __VLS_components.aModal, typeof __VLS_components.AModal, typeof __VLS_components.aModal, ]} */ ;
// @ts-ignore
const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({
    visible: (__VLS_ctx.incrementalModalVisible),
    title: "新增指标",
    footer: (false),
    width: "600px",
}));
const __VLS_2 = __VLS_1({
    visible: (__VLS_ctx.incrementalModalVisible),
    title: "新增指标",
    footer: (false),
    width: "600px",
}, ...__VLS_functionalComponentArgsRest(__VLS_1));
var __VLS_4 = {};
__VLS_3.slots.default;
const __VLS_5 = {}.ASpace;
/** @type {[typeof __VLS_components.ASpace, typeof __VLS_components.aSpace, typeof __VLS_components.ASpace, typeof __VLS_components.aSpace, ]} */ ;
// @ts-ignore
const __VLS_6 = __VLS_asFunctionalComponent(__VLS_5, new __VLS_5({
    direction: "vertical",
    size: "large",
    fill: true,
}));
const __VLS_7 = __VLS_6({
    direction: "vertical",
    size: "large",
    fill: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_6));
__VLS_8.slots.default;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ style: {} },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.h4, __VLS_intrinsicElements.h4)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({
    ...{ style: {} },
});
const __VLS_9 = {}.AButton;
/** @type {[typeof __VLS_components.AButton, typeof __VLS_components.aButton, typeof __VLS_components.AButton, typeof __VLS_components.aButton, ]} */ ;
// @ts-ignore
const __VLS_10 = __VLS_asFunctionalComponent(__VLS_9, new __VLS_9({
    ...{ 'onClick': {} },
    type: "primary",
    long: true,
}));
const __VLS_11 = __VLS_10({
    ...{ 'onClick': {} },
    type: "primary",
    long: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_10));
let __VLS_13;
let __VLS_14;
let __VLS_15;
const __VLS_16 = {
    onClick: (...[$event]) => {
        __VLS_ctx.downloadTemplate('incremental');
    }
};
__VLS_12.slots.default;
{
    const { icon: __VLS_thisSlot } = __VLS_12.slots;
    const __VLS_17 = {}.IconDownload;
    /** @type {[typeof __VLS_components.IconDownload, typeof __VLS_components.iconDownload, ]} */ ;
    // @ts-ignore
    const __VLS_18 = __VLS_asFunctionalComponent(__VLS_17, new __VLS_17({}));
    const __VLS_19 = __VLS_18({}, ...__VLS_functionalComponentArgsRest(__VLS_18));
}
var __VLS_12;
const __VLS_21 = {}.AUploadDragger;
/** @type {[typeof __VLS_components.AUploadDragger, typeof __VLS_components.aUploadDragger, typeof __VLS_components.AUploadDragger, typeof __VLS_components.aUploadDragger, ]} */ ;
// @ts-ignore
const __VLS_22 = __VLS_asFunctionalComponent(__VLS_21, new __VLS_21({
    ...{ 'onChange': {} },
    ...{ 'onDrop': {} },
    ...{ 'onDragover': {} },
    ...{ 'onDragleave': {} },
    showFileList: (false),
    customRequest: (__VLS_ctx.handleIncrementalUpload),
    accept: ".xlsx,.xls",
    drag: true,
    ...{ class: "upload-area" },
    ...{ class: ({ 'upload-area--dragover': __VLS_ctx.isDragover }) },
    ...{ style: {} },
}));
const __VLS_23 = __VLS_22({
    ...{ 'onChange': {} },
    ...{ 'onDrop': {} },
    ...{ 'onDragover': {} },
    ...{ 'onDragleave': {} },
    showFileList: (false),
    customRequest: (__VLS_ctx.handleIncrementalUpload),
    accept: ".xlsx,.xls",
    drag: true,
    ...{ class: "upload-area" },
    ...{ class: ({ 'upload-area--dragover': __VLS_ctx.isDragover }) },
    ...{ style: {} },
}, ...__VLS_functionalComponentArgsRest(__VLS_22));
let __VLS_25;
let __VLS_26;
let __VLS_27;
const __VLS_28 = {
    onChange: (...[$event]) => {
        __VLS_ctx.handleFileChange('incremental', $event, __VLS_ctx.incrementalFileCount);
    }
};
const __VLS_29 = {
    onDrop: (__VLS_ctx.handleDrop)
};
const __VLS_30 = {
    onDragover: (__VLS_ctx.handleDragOver)
};
const __VLS_31 = {
    onDragleave: (__VLS_ctx.handleDragLeave)
};
__VLS_24.slots.default;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "upload-content" },
});
const __VLS_32 = {}.IconUpload;
/** @type {[typeof __VLS_components.IconUpload, typeof __VLS_components.iconUpload, ]} */ ;
// @ts-ignore
const __VLS_33 = __VLS_asFunctionalComponent(__VLS_32, new __VLS_32({
    ...{ class: "upload-icon" },
    ...{ style: {} },
}));
const __VLS_34 = __VLS_33({
    ...{ class: "upload-icon" },
    ...{ style: {} },
}, ...__VLS_functionalComponentArgsRest(__VLS_33));
__VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({
    ...{ class: "upload-text" },
    ...{ style: {} },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
    ...{ class: "upload-highlight" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({
    ...{ class: "upload-hint" },
    ...{ style: {} },
});
if (__VLS_ctx.uploadProgress > 0) {
    const __VLS_36 = {}.AProgress;
    /** @type {[typeof __VLS_components.AProgress, typeof __VLS_components.aProgress, ]} */ ;
    // @ts-ignore
    const __VLS_37 = __VLS_asFunctionalComponent(__VLS_36, new __VLS_36({
        percent: (__VLS_ctx.uploadProgress),
        showText: (false),
    }));
    const __VLS_38 = __VLS_37({
        percent: (__VLS_ctx.uploadProgress),
        showText: (false),
    }, ...__VLS_functionalComponentArgsRest(__VLS_37));
}
if (__VLS_ctx.currentFile) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "file-preview" },
    });
    const __VLS_40 = {}.IconFile;
    /** @type {[typeof __VLS_components.IconFile, typeof __VLS_components.iconFile, ]} */ ;
    // @ts-ignore
    const __VLS_41 = __VLS_asFunctionalComponent(__VLS_40, new __VLS_40({
        ...{ style: {} },
    }));
    const __VLS_42 = __VLS_41({
        ...{ style: {} },
    }, ...__VLS_functionalComponentArgsRest(__VLS_41));
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
    (__VLS_ctx.currentFile.name);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ style: {} },
    });
    (__VLS_ctx.formatFileSize(__VLS_ctx.currentFile.size));
}
var __VLS_24;
if (__VLS_ctx.incrementalFileCount > 0) {
    const __VLS_44 = {}.AAlert;
    /** @type {[typeof __VLS_components.AAlert, typeof __VLS_components.aAlert, typeof __VLS_components.AAlert, typeof __VLS_components.aAlert, ]} */ ;
    // @ts-ignore
    const __VLS_45 = __VLS_asFunctionalComponent(__VLS_44, new __VLS_44({
        type: "info",
        ...{ style: {} },
    }));
    const __VLS_46 = __VLS_45({
        type: "info",
        ...{ style: {} },
    }, ...__VLS_functionalComponentArgsRest(__VLS_45));
    __VLS_47.slots.default;
    (__VLS_ctx.incrementalFileCount);
    const __VLS_48 = {}.ASpace;
    /** @type {[typeof __VLS_components.ASpace, typeof __VLS_components.aSpace, typeof __VLS_components.ASpace, typeof __VLS_components.aSpace, ]} */ ;
    // @ts-ignore
    const __VLS_49 = __VLS_asFunctionalComponent(__VLS_48, new __VLS_48({
        ...{ style: {} },
    }));
    const __VLS_50 = __VLS_49({
        ...{ style: {} },
    }, ...__VLS_functionalComponentArgsRest(__VLS_49));
    __VLS_51.slots.default;
    const __VLS_52 = {}.AButton;
    /** @type {[typeof __VLS_components.AButton, typeof __VLS_components.aButton, typeof __VLS_components.AButton, typeof __VLS_components.aButton, ]} */ ;
    // @ts-ignore
    const __VLS_53 = __VLS_asFunctionalComponent(__VLS_52, new __VLS_52({
        ...{ 'onClick': {} },
        type: "primary",
        size: "small",
    }));
    const __VLS_54 = __VLS_53({
        ...{ 'onClick': {} },
        type: "primary",
        size: "small",
    }, ...__VLS_functionalComponentArgsRest(__VLS_53));
    let __VLS_56;
    let __VLS_57;
    let __VLS_58;
    const __VLS_59 = {
        onClick: (__VLS_ctx.confirmIncrementalUpload)
    };
    __VLS_55.slots.default;
    var __VLS_55;
    const __VLS_60 = {}.AButton;
    /** @type {[typeof __VLS_components.AButton, typeof __VLS_components.aButton, typeof __VLS_components.AButton, typeof __VLS_components.aButton, ]} */ ;
    // @ts-ignore
    const __VLS_61 = __VLS_asFunctionalComponent(__VLS_60, new __VLS_60({
        ...{ 'onClick': {} },
        size: "small",
    }));
    const __VLS_62 = __VLS_61({
        ...{ 'onClick': {} },
        size: "small",
    }, ...__VLS_functionalComponentArgsRest(__VLS_61));
    let __VLS_64;
    let __VLS_65;
    let __VLS_66;
    const __VLS_67 = {
        onClick: (...[$event]) => {
            if (!(__VLS_ctx.incrementalFileCount > 0))
                return;
            __VLS_ctx.incrementalFileCount = 0;
        }
    };
    __VLS_63.slots.default;
    var __VLS_63;
    var __VLS_51;
    var __VLS_47;
}
var __VLS_8;
var __VLS_3;
/** @type {__VLS_StyleScopedClasses['upload-area']} */ ;
/** @type {__VLS_StyleScopedClasses['upload-area--dragover']} */ ;
/** @type {__VLS_StyleScopedClasses['upload-content']} */ ;
/** @type {__VLS_StyleScopedClasses['upload-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['upload-text']} */ ;
/** @type {__VLS_StyleScopedClasses['upload-highlight']} */ ;
/** @type {__VLS_StyleScopedClasses['upload-hint']} */ ;
/** @type {__VLS_StyleScopedClasses['file-preview']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            IconUpload: IconUpload,
            IconDownload: IconDownload,
            downloadTemplate: downloadTemplate,
            incrementalModalVisible: incrementalModalVisible,
            incrementalFileCount: incrementalFileCount,
            isDragover: isDragover,
            uploadProgress: uploadProgress,
            currentFile: currentFile,
            handleDragOver: handleDragOver,
            handleDragLeave: handleDragLeave,
            handleDrop: handleDrop,
            formatFileSize: formatFileSize,
            handleFileChange: handleFileChange,
            confirmIncrementalUpload: confirmIncrementalUpload,
            handleIncrementalUpload: handleIncrementalUpload,
        };
    },
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
});
; /* PartiallyEnd: #4569/main.vue */
