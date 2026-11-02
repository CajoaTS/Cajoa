import { Renderer } from '@cajoa/core';

declare const domRenderer: Renderer<Node>;

interface RouterLocation {
    pathname: string;
    search: string;
    hash: string;
}
declare const useLocation: () => () => RouterLocation;
declare const usePath: () => () => string;
interface NavigateOptions {
    replace?: boolean;
    scroll?: boolean;
}
declare function navigate(to: string, options?: NavigateOptions): void;
type SearchParamValue = string | number | boolean | null | undefined;
declare function useSearchParams(): [
    () => URLSearchParams,
    (values: Record<string, SearchParamValue>, options?: {
        replace?: boolean;
    }) => void
];
declare function useParams(): Record<string, string>;
interface RouteDef {
    __route: true;
    id: number;
    path: string;
    component?: () => unknown;
    children: RouteDef[];
}
declare function Route(props: {
    path: string;
    component?: () => unknown;
    children?: unknown;
}): RouteDef;
declare function Outlet(): unknown;
declare function Router(props: {
    base?: string;
    children?: unknown;
}): () => unknown;
declare function Link(props: {
    href: string;
    children?: unknown;
    [key: string]: unknown;
}): object;
declare function NavLink(props: {
    href: string;
    activeClass?: string;
    end?: boolean;
    class?: string;
    children?: unknown;
    [key: string]: unknown;
}): object;
declare function Navigate(props: {
    to: string;
    replace?: boolean;
    status?: number;
}): null;

type Reactive<T> = {
    [K in keyof T]: T[K] | (() => T[K]);
};
type Length = number | string;
type Suggest<T extends string> = T | (string & {});
type CSSProperties = {
    [K in keyof CSSStyleDeclaration as K extends number ? never : CSSStyleDeclaration[K] extends string ? K : never]?: string | false | null;
} & {
    [name: `${string}-${string}`]: string | false | null | undefined;
};
type TargetedEvent<E extends Element, Ev extends Event = Event> = Ev & {
    currentTarget: E;
};
type Handler<E extends Element, Ev extends Event> = ((event: TargetedEvent<E, Ev>) => void) | false | null | undefined;
interface Events<E extends Element> {
    onClick?: Handler<E, MouseEvent>;
    onAuxClick?: Handler<E, MouseEvent>;
    onDblClick?: Handler<E, MouseEvent>;
    onDoubleClick?: Handler<E, MouseEvent>;
    onContextMenu?: Handler<E, MouseEvent>;
    onMouseDown?: Handler<E, MouseEvent>;
    onMouseUp?: Handler<E, MouseEvent>;
    onMouseMove?: Handler<E, MouseEvent>;
    onMouseEnter?: Handler<E, MouseEvent>;
    onMouseLeave?: Handler<E, MouseEvent>;
    onMouseOver?: Handler<E, MouseEvent>;
    onMouseOut?: Handler<E, MouseEvent>;
    onWheel?: Handler<E, WheelEvent>;
    onPointerDown?: Handler<E, PointerEvent>;
    onPointerUp?: Handler<E, PointerEvent>;
    onPointerMove?: Handler<E, PointerEvent>;
    onPointerEnter?: Handler<E, PointerEvent>;
    onPointerLeave?: Handler<E, PointerEvent>;
    onPointerOver?: Handler<E, PointerEvent>;
    onPointerOut?: Handler<E, PointerEvent>;
    onPointerCancel?: Handler<E, PointerEvent>;
    onGotPointerCapture?: Handler<E, PointerEvent>;
    onLostPointerCapture?: Handler<E, PointerEvent>;
    onTouchStart?: Handler<E, TouchEvent>;
    onTouchMove?: Handler<E, TouchEvent>;
    onTouchEnd?: Handler<E, TouchEvent>;
    onTouchCancel?: Handler<E, TouchEvent>;
    onKeyDown?: Handler<E, KeyboardEvent>;
    onKeyUp?: Handler<E, KeyboardEvent>;
    onKeyPress?: Handler<E, KeyboardEvent>;
    onFocus?: Handler<E, FocusEvent>;
    onBlur?: Handler<E, FocusEvent>;
    onFocusIn?: Handler<E, FocusEvent>;
    onFocusOut?: Handler<E, FocusEvent>;
    onInput?: Handler<E, Event>;
    onBeforeInput?: Handler<E, InputEvent>;
    onChange?: Handler<E, Event>;
    onSubmit?: Handler<E, SubmitEvent>;
    onReset?: Handler<E, Event>;
    onInvalid?: Handler<E, Event>;
    onSelect?: Handler<E, Event>;
    onFormData?: Handler<E, FormDataEvent>;
    onCompositionStart?: Handler<E, CompositionEvent>;
    onCompositionUpdate?: Handler<E, CompositionEvent>;
    onCompositionEnd?: Handler<E, CompositionEvent>;
    onCopy?: Handler<E, ClipboardEvent>;
    onCut?: Handler<E, ClipboardEvent>;
    onPaste?: Handler<E, ClipboardEvent>;
    onDrag?: Handler<E, DragEvent>;
    onDragStart?: Handler<E, DragEvent>;
    onDragEnd?: Handler<E, DragEvent>;
    onDragEnter?: Handler<E, DragEvent>;
    onDragLeave?: Handler<E, DragEvent>;
    onDragOver?: Handler<E, DragEvent>;
    onDrop?: Handler<E, DragEvent>;
    onAnimationStart?: Handler<E, AnimationEvent>;
    onAnimationEnd?: Handler<E, AnimationEvent>;
    onAnimationIteration?: Handler<E, AnimationEvent>;
    onAnimationCancel?: Handler<E, AnimationEvent>;
    onTransitionStart?: Handler<E, TransitionEvent>;
    onTransitionEnd?: Handler<E, TransitionEvent>;
    onTransitionRun?: Handler<E, TransitionEvent>;
    onTransitionCancel?: Handler<E, TransitionEvent>;
    onScroll?: Handler<E, Event>;
    onScrollEnd?: Handler<E, Event>;
    onLoad?: Handler<E, Event>;
    onError?: Handler<E, Event>;
    onToggle?: Handler<E, Event>;
    onClose?: Handler<E, Event>;
    onCancel?: Handler<E, Event>;
    onSlotChange?: Handler<E, Event>;
    onAbort?: Handler<E, Event>;
    onCanPlay?: Handler<E, Event>;
    onCanPlayThrough?: Handler<E, Event>;
    onDurationChange?: Handler<E, Event>;
    onEmptied?: Handler<E, Event>;
    onEnded?: Handler<E, Event>;
    onLoadedData?: Handler<E, Event>;
    onLoadedMetadata?: Handler<E, Event>;
    onLoadStart?: Handler<E, Event>;
    onPause?: Handler<E, Event>;
    onPlay?: Handler<E, Event>;
    onPlaying?: Handler<E, Event>;
    onProgress?: Handler<E, Event>;
    onRateChange?: Handler<E, Event>;
    onSeeked?: Handler<E, Event>;
    onSeeking?: Handler<E, Event>;
    onStalled?: Handler<E, Event>;
    onSuspend?: Handler<E, Event>;
    onTimeUpdate?: Handler<E, Event>;
    onVolumeChange?: Handler<E, Event>;
    onWaiting?: Handler<E, Event>;
}
interface Common<E extends Element> {
    children?: unknown;
    ref?: (el: E) => void;
}
type Bool = "true" | "false";
interface AriaAttributes {
    "aria-label"?: string;
    "aria-labelledby"?: string;
    "aria-describedby"?: string;
    "aria-controls"?: string;
    "aria-owns"?: string;
    "aria-activedescendant"?: string;
    "aria-errormessage"?: string;
    "aria-placeholder"?: string;
    "aria-roledescription"?: string;
    "aria-valuetext"?: string;
    "aria-hidden"?: Bool;
    "aria-expanded"?: Bool;
    "aria-disabled"?: Bool;
    "aria-required"?: Bool;
    "aria-readonly"?: Bool;
    "aria-busy"?: Bool;
    "aria-atomic"?: Bool;
    "aria-modal"?: Bool;
    "aria-multiline"?: Bool;
    "aria-multiselectable"?: Bool;
    "aria-selected"?: Bool;
    "aria-invalid"?: Bool | "grammar" | "spelling";
    "aria-checked"?: Bool | "mixed";
    "aria-pressed"?: Bool | "mixed";
    "aria-current"?: Bool | "page" | "step" | "location" | "date" | "time";
    "aria-live"?: "off" | "polite" | "assertive";
    "aria-haspopup"?: Bool | "menu" | "listbox" | "tree" | "grid" | "dialog";
    "aria-orientation"?: "horizontal" | "vertical";
    "aria-valuemin"?: number;
    "aria-valuemax"?: number;
    "aria-valuenow"?: number;
    "aria-level"?: number;
    "aria-posinset"?: number;
    "aria-setsize"?: number;
}
interface GlobalAttributes extends AriaAttributes {
    accessKey?: string;
    autoCapitalize?: "off" | "none" | "on" | "sentences" | "words" | "characters";
    autoFocus?: boolean;
    class?: string;
    className?: string;
    contentEditable?: true | "true" | "false" | "plaintext-only" | "inherit";
    dir?: "ltr" | "rtl" | "auto";
    draggable?: "true" | "false";
    enterKeyHint?: "enter" | "done" | "go" | "next" | "previous" | "search" | "send";
    hidden?: boolean | "until-found";
    id?: string;
    inert?: boolean;
    inputMode?: "none" | "text" | "tel" | "url" | "email" | "numeric" | "decimal" | "search";
    is?: string;
    lang?: string;
    nonce?: string;
    part?: string;
    popover?: "auto" | "manual" | "";
    role?: string;
    slot?: string;
    spellCheck?: "true" | "false";
    style?: string | CSSProperties;
    tabIndex?: number;
    title?: string;
    translate?: "yes" | "no";
}
type Referrer = "" | "no-referrer" | "no-referrer-when-downgrade" | "origin" | "origin-when-cross-origin" | "same-origin" | "strict-origin" | "strict-origin-when-cross-origin" | "unsafe-url";
type CrossOrigin = "anonymous" | "use-credentials" | "";
type InputType = "button" | "checkbox" | "color" | "date" | "datetime-local" | "email" | "file" | "hidden" | "image" | "month" | "number" | "password" | "radio" | "range" | "reset" | "search" | "submit" | "tel" | "text" | "time" | "url" | "week";
type Target = Suggest<"_self" | "_blank" | "_parent" | "_top">;
interface MediaAttributes {
    autoPlay?: boolean;
    controls?: boolean;
    crossOrigin?: CrossOrigin;
    loop?: boolean;
    muted?: boolean;
    preload?: "none" | "metadata" | "auto" | "";
    src?: string;
}
interface HTMLSpecific {
    a: {
        download?: string | boolean;
        href?: string;
        hrefLang?: string;
        ping?: string;
        referrerPolicy?: Referrer;
        rel?: string;
        target?: Target;
        type?: string;
    };
    area: {
        alt?: string;
        coords?: string;
        download?: string | boolean;
        href?: string;
        rel?: string;
        shape?: "rect" | "circle" | "poly" | "default";
        target?: Target;
    };
    audio: MediaAttributes;
    base: {
        href?: string;
        target?: Target;
    };
    blockquote: {
        cite?: string;
    };
    button: {
        disabled?: boolean;
        form?: string;
        formAction?: string;
        formEncType?: string;
        formMethod?: "get" | "post" | "dialog";
        formNoValidate?: boolean;
        formTarget?: Target;
        name?: string;
        type?: "button" | "submit" | "reset";
        value?: string | number;
    };
    canvas: {
        width?: Length;
        height?: Length;
    };
    col: {
        span?: number;
    };
    colgroup: {
        span?: number;
    };
    data: {
        value?: string;
    };
    del: {
        cite?: string;
        dateTime?: string;
    };
    details: {
        open?: boolean;
        name?: string;
    };
    dialog: {
        open?: boolean;
    };
    embed: {
        height?: Length;
        src?: string;
        type?: string;
        width?: Length;
    };
    fieldset: {
        disabled?: boolean;
        form?: string;
        name?: string;
    };
    form: {
        acceptCharset?: string;
        action?: string;
        autoComplete?: "on" | "off";
        encType?: string;
        method?: "get" | "post" | "dialog";
        name?: string;
        noValidate?: boolean;
        target?: Target;
    };
    iframe: {
        allow?: string;
        allowFullScreen?: boolean;
        height?: Length;
        loading?: "eager" | "lazy";
        name?: string;
        referrerPolicy?: Referrer;
        sandbox?: string;
        src?: string;
        srcDoc?: string;
        width?: Length;
    };
    img: {
        alt?: string;
        crossOrigin?: CrossOrigin;
        decoding?: "sync" | "async" | "auto";
        fetchPriority?: "high" | "low" | "auto";
        height?: Length;
        loading?: "eager" | "lazy";
        referrerPolicy?: Referrer;
        sizes?: string;
        src?: string;
        srcSet?: string;
        useMap?: string;
        width?: Length;
    };
    input: {
        accept?: string;
        alt?: string;
        autoComplete?: string;
        capture?: boolean | "user" | "environment";
        checked?: boolean;
        dirName?: string;
        disabled?: boolean;
        form?: string;
        formAction?: string;
        formEncType?: string;
        formMethod?: "get" | "post" | "dialog";
        formNoValidate?: boolean;
        formTarget?: Target;
        height?: Length;
        list?: string;
        max?: number | string;
        maxLength?: number;
        min?: number | string;
        minLength?: number;
        multiple?: boolean;
        name?: string;
        pattern?: string;
        placeholder?: string;
        readOnly?: boolean;
        required?: boolean;
        size?: number;
        src?: string;
        step?: number | string;
        type?: InputType;
        value?: string | number;
        width?: Length;
    };
    ins: {
        cite?: string;
        dateTime?: string;
    };
    label: {
        form?: string;
        for?: string;
        htmlFor?: string;
    };
    li: {
        value?: number;
    };
    link: {
        as?: string;
        crossOrigin?: CrossOrigin;
        href?: string;
        hrefLang?: string;
        integrity?: string;
        media?: string;
        referrerPolicy?: Referrer;
        rel?: string;
        sizes?: string;
        type?: string;
    };
    map: {
        name?: string;
    };
    meta: {
        charSet?: string;
        content?: string;
        httpEquiv?: string;
        media?: string;
        name?: string;
    };
    meter: {
        high?: number;
        low?: number;
        max?: number;
        min?: number;
        optimum?: number;
        value?: number;
    };
    object: {
        data?: string;
        form?: string;
        height?: Length;
        name?: string;
        type?: string;
        width?: Length;
    };
    ol: {
        reversed?: boolean;
        start?: number;
        type?: "1" | "a" | "A" | "i" | "I";
    };
    optgroup: {
        disabled?: boolean;
        label?: string;
    };
    option: {
        disabled?: boolean;
        label?: string;
        selected?: boolean;
        value?: string | number;
    };
    output: {
        for?: string;
        form?: string;
        htmlFor?: string;
        name?: string;
    };
    progress: {
        max?: number;
        value?: number;
    };
    q: {
        cite?: string;
    };
    script: {
        async?: boolean;
        crossOrigin?: CrossOrigin;
        defer?: boolean;
        integrity?: string;
        noModule?: boolean;
        referrerPolicy?: Referrer;
        src?: string;
        type?: string;
    };
    select: {
        autoComplete?: string;
        disabled?: boolean;
        form?: string;
        multiple?: boolean;
        name?: string;
        required?: boolean;
        size?: number;
        value?: string | number;
    };
    slot: {
        name?: string;
    };
    source: {
        height?: Length;
        media?: string;
        sizes?: string;
        src?: string;
        srcSet?: string;
        type?: string;
        width?: Length;
    };
    style: {
        media?: string;
        type?: string;
    };
    td: {
        colSpan?: number;
        headers?: string;
        rowSpan?: number;
    };
    textarea: {
        autoComplete?: string;
        cols?: number;
        dirName?: string;
        disabled?: boolean;
        form?: string;
        maxLength?: number;
        minLength?: number;
        name?: string;
        placeholder?: string;
        readOnly?: boolean;
        required?: boolean;
        rows?: number;
        value?: string | number;
        wrap?: "hard" | "soft" | "off";
    };
    th: {
        abbr?: string;
        colSpan?: number;
        headers?: string;
        rowSpan?: number;
        scope?: "row" | "col" | "rowgroup" | "colgroup";
    };
    time: {
        dateTime?: string;
    };
    track: {
        default?: boolean;
        kind?: "subtitles" | "captions" | "descriptions" | "chapters" | "metadata";
        label?: string;
        src?: string;
        srcLang?: string;
    };
    video: MediaAttributes & {
        height?: Length;
        playsInline?: boolean;
        poster?: string;
        width?: Length;
    };
}
type HTMLProps<K extends keyof HTMLElementTagNameMap> = Common<HTMLElementTagNameMap[K]> & Events<HTMLElementTagNameMap[K]> & Reactive<GlobalAttributes & (K extends keyof HTMLSpecific ? HTMLSpecific[K] : {})>;
type HTMLElements = {
    [K in keyof HTMLElementTagNameMap]: HTMLProps<K>;
};
interface SVGGlobalAttributes extends AriaAttributes {
    class?: string;
    className?: string;
    id?: string;
    lang?: string;
    role?: string;
    style?: string | CSSProperties;
    tabIndex?: number;
    transform?: string;
    clipPath?: string;
    clipRule?: string;
    color?: string;
    cursor?: string;
    display?: string;
    dominantBaseline?: string;
    fill?: string;
    fillOpacity?: Length;
    fillRule?: "nonzero" | "evenodd";
    filter?: string;
    floodColor?: string;
    floodOpacity?: Length;
    fontFamily?: string;
    fontSize?: Length;
    fontWeight?: Length;
    letterSpacing?: Length;
    markerEnd?: string;
    markerMid?: string;
    markerStart?: string;
    mask?: string;
    opacity?: Length;
    pointerEvents?: string;
    shapeRendering?: string;
    stopColor?: string;
    stopOpacity?: Length;
    stroke?: string;
    strokeDasharray?: Length;
    strokeDashoffset?: Length;
    strokeLinecap?: "butt" | "round" | "square";
    strokeLinejoin?: "miter" | "round" | "bevel" | "arcs" | "miter-clip";
    strokeMiterlimit?: Length;
    strokeOpacity?: Length;
    strokeWidth?: Length;
    textAnchor?: "start" | "middle" | "end";
    vectorEffect?: string;
    visibility?: "visible" | "hidden" | "collapse";
}
interface SVGSpecific {
    svg: {
        height?: Length;
        preserveAspectRatio?: string;
        viewBox?: string;
        width?: Length;
        x?: Length;
        xmlns?: string;
        y?: Length;
    };
    symbol: {
        preserveAspectRatio?: string;
        viewBox?: string;
    };
    circle: {
        cx?: Length;
        cy?: Length;
        r?: Length;
        pathLength?: number;
    };
    ellipse: {
        cx?: Length;
        cy?: Length;
        rx?: Length;
        ry?: Length;
        pathLength?: number;
    };
    line: {
        pathLength?: number;
        x1?: Length;
        x2?: Length;
        y1?: Length;
        y2?: Length;
    };
    path: {
        d?: string;
        pathLength?: number;
    };
    polygon: {
        pathLength?: number;
        points?: string;
    };
    polyline: {
        pathLength?: number;
        points?: string;
    };
    rect: {
        height?: Length;
        pathLength?: number;
        rx?: Length;
        ry?: Length;
        width?: Length;
        x?: Length;
        y?: Length;
    };
    text: {
        dx?: Length;
        dy?: Length;
        lengthAdjust?: "spacing" | "spacingAndGlyphs";
        rotate?: string;
        textLength?: Length;
        x?: Length;
        y?: Length;
    };
    tspan: {
        dx?: Length;
        dy?: Length;
        lengthAdjust?: "spacing" | "spacingAndGlyphs";
        rotate?: string;
        textLength?: Length;
        x?: Length;
        y?: Length;
    };
    textPath: {
        href?: string;
        method?: "align" | "stretch";
        spacing?: "auto" | "exact";
        startOffset?: Length;
    };
    use: {
        height?: Length;
        href?: string;
        width?: Length;
        x?: Length;
        y?: Length;
    };
    image: {
        height?: Length;
        href?: string;
        preserveAspectRatio?: string;
        width?: Length;
        x?: Length;
        y?: Length;
    };
    foreignObject: {
        height?: Length;
        width?: Length;
        x?: Length;
        y?: Length;
    };
    linearGradient: {
        gradientTransform?: string;
        gradientUnits?: "userSpaceOnUse" | "objectBoundingBox";
        href?: string;
        spreadMethod?: "pad" | "reflect" | "repeat";
        x1?: Length;
        x2?: Length;
        y1?: Length;
        y2?: Length;
    };
    radialGradient: {
        cx?: Length;
        cy?: Length;
        fr?: Length;
        fx?: Length;
        fy?: Length;
        gradientTransform?: string;
        gradientUnits?: "userSpaceOnUse" | "objectBoundingBox";
        href?: string;
        r?: Length;
        spreadMethod?: "pad" | "reflect" | "repeat";
    };
    stop: {
        offset?: Length;
    };
    pattern: {
        height?: Length;
        patternContentUnits?: "userSpaceOnUse" | "objectBoundingBox";
        patternTransform?: string;
        patternUnits?: "userSpaceOnUse" | "objectBoundingBox";
        preserveAspectRatio?: string;
        viewBox?: string;
        width?: Length;
        x?: Length;
        y?: Length;
    };
    clipPath: {
        clipPathUnits?: "userSpaceOnUse" | "objectBoundingBox";
    };
    mask: {
        height?: Length;
        maskContentUnits?: "userSpaceOnUse" | "objectBoundingBox";
        maskUnits?: "userSpaceOnUse" | "objectBoundingBox";
        width?: Length;
        x?: Length;
        y?: Length;
    };
    marker: {
        markerHeight?: Length;
        markerUnits?: "strokeWidth" | "userSpaceOnUse";
        markerWidth?: Length;
        orient?: string;
        preserveAspectRatio?: string;
        refX?: Length;
        refY?: Length;
        viewBox?: string;
    };
    filter: {
        filterUnits?: "userSpaceOnUse" | "objectBoundingBox";
        height?: Length;
        primitiveUnits?: "userSpaceOnUse" | "objectBoundingBox";
        width?: Length;
        x?: Length;
        y?: Length;
    };
}
type LooseSVG = `fe${string}` | `animate${string}` | "set" | "mpath" | "discard";
type SVGProps<K extends keyof SVGElementTagNameMap> = Common<SVGElementTagNameMap[K]> & Events<SVGElementTagNameMap[K]> & Reactive<SVGGlobalAttributes & (K extends keyof SVGSpecific ? SVGSpecific[K] : K extends LooseSVG ? Record<string, any> : {})>;
type SVGElements = {
    [K in Exclude<keyof SVGElementTagNameMap, keyof HTMLElementTagNameMap>]: SVGProps<K>;
};
type CustomElementProps = Common<HTMLElement> & Events<HTMLElement> & {
    [attribute: string]: any;
};
declare namespace JSX {
    type Element = any;
    interface ElementChildrenAttribute {
        children: {};
    }
    interface IntrinsicElements extends HTMLElements, SVGElements {
        [element: `${string}-${string}`]: CustomElementProps;
    }
}

/**
 * Sets the page title. In the browser it changes document.title and puts the old title back
 * when the component is removed. On the server it fills the `head` object.
 */
declare function Title(props: {
    children?: unknown;
}): null;
/**
 * Adds or updates a <meta> tag, for example <Meta name="description" content="..." />.
 * Use `property` instead of `name` for tags like og:title. `content` can be a function.
 */
declare function Meta(props: {
    name?: string;
    property?: string;
    content: unknown;
}): null;

export { JSX, Link, Meta, NavLink, Navigate, Outlet, Route, Router, Title, domRenderer, navigate, useLocation, useParams, usePath, useSearchParams };
export type { CSSProperties, NavigateOptions, RouteDef, RouterLocation, SearchParamValue, TargetedEvent };
