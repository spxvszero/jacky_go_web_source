/*-------------------------
moovie.js - HTML5 Media player made for movies
Made by: Bruno Vieira
--------------------------- */

class Moovie {
    constructor(options) {

        const defaults = {
            selector: 'defaultId',
            dimensions: {
                width: "100%"
            },
            config: {
                storage: {
                    captionOffset: false,
                    playrateSpeed: false,
                    captionSize: false
                },
                controls: {
                    playtime: true,
                    mute: true,
                    volume: true,
                    subtitles: true,
                    config: true,
                    fullscreen: true,
                    submenuCaptions: true,
                    submenuOffset: true,
                    submenuSpeed: true,
                    allowLocalSubtitles: true
                },
                i18n: {
                    play: "(Play:Pause)",
                    mute: "(Mute:Unmute)",
                    subtitles: "(Enable:Disable) Subtitles",
                    config: "Settings",
                    fullscreen: "(Enter:Exit) Fullscreen",
                    main_topic: "settings:",
                    main_caption: "Captions",
                    main_offset: "Caption Offset",
                    main_speed: "Speed",
                    main_disabled: "Disabled",
                    main_default: "Default",
                    caption_topic: "Captions:",
                    caption_back: "Back",
                    caption_load: "Load Locally",
                    offset_topic: "Adjust Caption Offset",
                    speed_topic: "Speed Adjust"
                }
            },
            icons: {
                path: "./icons/"
            },
            customEvents: [{
                type: "",
                to: "",
                starttime: "",
                endtime: "",
                content: "",
                position: "",
                class: ""
            }]
        };

        // Player Random ID
        var randomID = Math.floor(Math.random() * (9999 - 0 + 1)) + 0;

        // Get Defaults Controls
        options.config == undefined ? options.config = defaults.config : options.config;
        options.config.controls == undefined ? options.config.controls = defaults.config.controls : options.config.controls
        for (var key in defaults.config.controls) { options.config.controls[key] == undefined ? options.config.controls[key] = defaults.config.controls[key] : options.config.controls[key] = options.config.controls[key]; }

        // Get default storage
        options.config.storage == undefined ? options.config.storage = defaults.config.storage : options.config.storage
        for (var key in defaults.config.storage) { options.config.storage[key] == undefined ? options.config.storage[key] = defaults.config.storage[key] : options.config.storage[key] = options.config.storage[key]; }

        // Get default i18n
        options.config.i18n == undefined ? options.config.i18n = defaults.config.i18n : options.config.i18n
        for (var key in defaults.config.i18n) { options.config.i18n[key] == undefined ? options.config.i18n[key] = defaults.config.i18n[key] : options.config.i18n[key] = options.config.i18n[key]; }

        this.selector = options.selector.substring(1) || defaults.selector.substring(1);
        this.dimensions = options.dimensions || defaults.dimensions;
        this.config = options.config || defaults.config;
        this.i18n = options.config.i18n || defaults.config.i18n;
        this.icons = options.icons || defaults.icons;
        this.customEvents = options.customEvents || defaults.customEvents;
        this.element = document.getElementById(this.selector);
        this.randomID = randomID;
        this.options = options || defaults;
        this.events = {
            captions: {
                name: false,
                subtitles: false
            },
            offset: {
                value: false
            }
        }

        // Global
        var _this = this;
        var parts, video, subtitles = 0,
            fullyloaded = 0,
            cuevalue = 0,
            speed = 1,
            moovie_el_play, moovie_el_buffered, moovie_el_mute, moovie_el_subtitles, moovie_el_fullscreen, moovie_el_locally, moovie_ul_soundv, moovie_el_sinput, moovie_el_rinput, hassubtitles = 0,
            moovie_el_range, moovie_el_localsub, moovie_el_speed, moovie_ishiden = 0,
            moovie_el_cuetimer, moovie_el_player, moovie_elprogress, moovie_el_toggle, ranges, fullscreen, offsettime = 0,
            isopen = 0,
            moovie_el_volume, moovie_el_video, moovie_el_poster, moovie_el_submenu, moovie_el_controls, moovie_el_progress, moovie_el_captions, moovie_el_submain;
        var selectedCaption = [];
        var icons = this.icons;
        var config = this.config;
        var dimensions = this.dimensions;
        var selector = this.selector;
        var customEvents = this.customEvents;

        // Main menu object
        var mainmenu = this.mainmenu = [{
                name: "play_button",
                element: "<button class='player__button toggle' id='tooglebutton_" + randomID + "'>\
                <svg id='moovie_bplay_play_" + randomID + "' version=\"1.1\" fill=\"white\" xmlns=\"http://www.w3.org/2000/svg\" xmlns:xlink=\"http://www.w3.org/1999/xlink\" x=\"0px\" y=\"0px\" width=\"163.861px\" height=\"163.861px\" viewBox=\"0 0 163.861 163.861\" style=\"enable-background:new 0 0 163.861 163.861;\" xml:space=\"preserve\"><g><path d=\"M34.857,3.613C20.084-4.861,8.107,2.081,8.107,19.106v125.637c0,17.042,11.977,23.975,26.75,15.509L144.67,97.275c14.778-8.477,14.778-22.211,0-30.686L34.857,3.613z\"/></g></svg>\
                <svg id='moovie_bplay_pause_" + randomID + "' style='display:none;' version=\"1.1\" fill=\"white\" xmlns=\"http://www.w3.org/2000/svg\" xmlns:xlink=\"http://www.w3.org/1999/xlink\" x=\"0px\" y=\"0px\" viewBox=\"0 0 47.607 47.607\" style=\"enable-background:new 0 0 47.607 47.607;\" xml:space=\"preserve\"><g><path  d=\"M17.991,40.976c0,3.662-2.969,6.631-6.631,6.631l0,0c-3.662,0-6.631-2.969-6.631-6.631V6.631C4.729,2.969,7.698,0,11.36,0l0,0c3.662,0,6.631,2.969,6.631,6.631V40.976z\"/><path d=\"M42.877,40.976c0,3.662-2.969,6.631-6.631,6.631l0,0c-3.662,0-6.631-2.969-6.631-6.631V6.631C29.616,2.969,32.585,0,36.246,0l0,0c3.662,0,6.631,2.969,6.631,6.631V40.976z\"/></g></svg>\
                </button>",
                opcional: false,
                tooltip: this.i18n.play
            },
            {
                name: "progress_bar",
                element: "<div class='moovie_cuetime' id='moovie_cue_timer_" + randomID + "'>loading...</div><div id='moovie_moovie_el_progressbar_" + randomID + "' class='moovie_progress player__slider' top:15px;><input type='range' id='range_progress_" + randomID + "' class='styled-slider slider-progress' min='0' value='0' step='0.01' autocomplete='off' style='width: 100%; cursor:pointer;' /><canvas id='moovie_buffered_" + randomID + "' style='position: absolute; bottom: 14px; left: 0; opacity: 0.4;  width: 100%; height:5px;'></canvas></div>",
                opcional: false,
                tooltip: false
            },
            {
                name: "playtime",
                element: "<div id='moovie_el_current_" + randomID + "' class='player__button player_button_disabled moovie_currentime'><span id='moovie_currentime_" + randomID + "'>00:00</span> / <span id='moovie_fulltime_" + randomID + "'></span></div>",
                opcional: true,
                tooltip: false
            },
            {
                name: "mute",
                element: "<button id='mooviegrid_mute_" + randomID + "' class='player__button'>\
                <svg id=\"icon_volume_unmute_" + randomID + "\" version=\"1.1\" fill=\"white\" xmlns=\"http://www.w3.org/2000/svg\" xmlns:xlink=\"http://www.w3.org/1999/xlink\" x=\"0px\" y=\"0px\" viewBox=\"0 0 480 480\" style=\"enable-background:new 0 0 480 480;\" xml:space=\"preserve\"><path d=\"M278.944,17.577c-5.568-2.656-12.128-1.952-16.928,1.92L106.368,144.009H32c-17.632,0-32,14.368-32,32v128c0,17.664,14.368,32,32,32h74.368l155.616,124.512c2.912,2.304,6.464,3.488,10.016,3.488c2.368,0,4.736-0.544,6.944-1.6c5.536-2.656,9.056-8.256,9.056-14.4v-416C288,25.865,284.48,20.265,278.944,17.577z\"/><path d=\"M368.992,126.857c-6.304-6.208-16.416-6.112-22.624,0.128c-6.208,6.304-6.144,16.416,0.128,22.656C370.688,173.513,384,205.609,384,240.009s-13.312,66.496-37.504,90.368c-6.272,6.176-6.336,16.32-0.128,22.624c3.136,3.168,7.264,4.736,11.36,4.736c4.064,0,8.128-1.536,11.264-4.64C399.328,323.241,416,283.049,416,240.009S399.328,156.777,368.992,126.857z\"/><path d=\"M414.144,81.769c-6.304-6.24-16.416-6.176-22.656,0.096c-6.208,6.272-6.144,16.416,0.096,22.624C427.968,140.553,448,188.681,448,240.009s-20.032,99.424-56.416,135.488c-6.24,6.24-6.304,16.384-0.096,22.656c3.168,3.136,7.264,4.704,11.36,4.704c4.064,0,8.16-1.536,11.296-4.64C456.64,356.137,480,299.945,480,240.009S456.64,123.881,414.144,81.769z\"/></svg>\
                <svg id=\"icon_volume_mute_" + randomID + "\" style='display:none;' fill=\"white\"  enable-background=\"new 0 0 448.075 448.075\" viewBox=\"0 0 448.075 448.075\" xmlns=\"http://www.w3.org/2000/svg\"><path d=\"m352.021 16.075c0-6.08-3.52-11.84-8.96-14.4-5.76-2.88-12.16-1.92-16.96 1.92l-141.76 112.96 167.68 167.68z\"/><path d=\"m443.349 420.747-416-416c-6.24-6.24-16.384-6.24-22.624 0s-6.24 16.384 0 22.624l100.672 100.704h-9.376c-9.92 0-18.56 4.48-24.32 11.52-4.8 5.44-7.68 12.8-7.68 20.48v128c0 17.6 14.4 32 32 32h74.24l155.84 124.48c2.88 2.24 6.4 3.52 9.92 3.52 2.24 0 4.8-.64 7.04-1.6 5.44-2.56 8.96-8.32 8.96-14.4v-57.376l68.672 68.672c3.136 3.136 7.232 4.704 11.328 4.704s8.192-1.568 11.328-4.672c6.24-6.272 6.24-16.384 0-22.656z\"/></svg>\
                </button>",
                opcional: true,
                tooltip: this.i18n.mute
            },
            {
                name: "volume",
                element: "<input type='range' id='mooviegrid_volume_" + randomID + "' style='max-width:100px; min-width:50px;' name='volume' class='moovie_progress_sound' min=0 max='1' step='0.01' value='1'>",
                opcional: true,
                tooltip: false
            },
            {
                name: "subtitles",
                element: "<button id='moovie_subtitle_" + randomID + "' style='margin-left:5px' class='player__button'>\
                <svg class='opacity_svg' id='moovie_subtitle_svg_" + randomID + "' version=\"1.1\" fill='white' xmlns=\"http://www.w3.org/2000/svg\" xmlns:xlink=\"http://www.w3.org/1999/xlink\" x=\"0px\" y=\"0px\" width=\"459px\" height=\"459px\" viewBox=\"0 0 459 459\" style=\"enable-background:new 0 0 459 459;\" xml:space=\"preserve\"><g><g id=\"closed-caption\"><path d=\"M408,25.5H51c-28.05,0-51,22.95-51,51v306c0,28.05,22.95,51,51,51h357c28.05,0,51-22.95,51-51v-306C459,48.45,436.05,25.5,408,25.5z M204,204h-38.25v-12.75h-51v76.5h51V255H204v25.5c0,15.3-10.2,25.5-25.5,25.5H102c-15.3,0-25.5-10.2-25.5-25.5v-102c0-15.3,10.2-25.5,25.5-25.5h76.5c15.3,0,25.5,10.2,25.5,25.5V204z M382.5,204h-38.25v-12.75h-51v76.5h51V255h38.25v25.5c0,15.3-10.2,25.5-25.5,25.5h-76.5c-15.3,0-25.5-10.2-25.5-25.5v-102c0-15.3,10.2-25.5,25.5-25.5H357c15.3,0,25.5,10.2,25.5,25.5V204z\"/></g></g></svg>\
                </button>",
                opcional: true,
                tooltip: this.i18n.subtitles
            },
            {
                name: "config",
                element: "<button id='moovie_el_cog_" + randomID + "' class='player__button'>\
                <svg version=\"1.1\" fill=\"white\" xmlns=\"http://www.w3.org/2000/svg\" xmlns:xlink=\"http://www.w3.org/1999/xlink\" x=\"0px\" y=\"0px\" width=\"25px\" height=\"25.001px\" viewBox=\"0 0 25 25.001\" style=\"enable-background:new 0 0 25 25.001;\" xml:space=\"preserve\"><g><path d=\"M24.38,10.175l-2.231-0.268c-0.228-0.851-0.562-1.655-0.992-2.401l1.387-1.763c0.212-0.271,0.188-0.69-0.057-0.934l-2.299-2.3c-0.242-0.243-0.662-0.269-0.934-0.057l-1.766,1.389c-0.743-0.43-1.547-0.764-2.396-0.99L14.825,0.62C14.784,0.279,14.469,0,14.125,0h-3.252c-0.344,0-0.659,0.279-0.699,0.62L9.906,2.851c-0.85,0.227-1.655,0.562-2.398,0.991L5.743,2.455c-0.27-0.212-0.69-0.187-0.933,0.056L2.51,4.812C2.268,5.054,2.243,5.474,2.456,5.746L3.842,7.51c-0.43,0.744-0.764,1.549-0.991,2.4l-2.23,0.267C0.28,10.217,0,10.532,0,10.877v3.252c0,0.344,0.279,0.657,0.621,0.699l2.231,0.268c0.228,0.848,0.561,1.652,0.991,2.396l-1.386,1.766c-0.211,0.271-0.187,0.69,0.057,0.934l2.296,2.301c0.243,0.242,0.663,0.269,0.933,0.057l1.766-1.39c0.744,0.43,1.548,0.765,2.398,0.991l0.268,2.23c0.041,0.342,0.355,0.62,0.699,0.62h3.252c0.345,0,0.659-0.278,0.699-0.62l0.268-2.23c0.851-0.228,1.655-0.562,2.398-0.991l1.766,1.387c0.271,0.212,0.69,0.187,0.933-0.056l2.299-2.301c0.244-0.242,0.269-0.662,0.056-0.935l-1.388-1.764c0.431-0.744,0.764-1.548,0.992-2.397l2.23-0.268C24.721,14.785,25,14.473,25,14.127v-3.252C25.001,10.529,24.723,10.216,24.38,10.175z M12.501,18.75c-3.452,0-6.25-2.798-6.25-6.25s2.798-6.25,6.25-6.25s6.25,2.798,6.25,6.25S15.954,18.75,12.501,18.75z\"/></g></svg>\
                </button>",
                opcional: true,
                tooltip: this.i18n.config
            },
            {
                name: "fullscreen",
                element: "<button id='fullscreen_" + randomID + "' class='player__button fullscreen_button'>\
                    <svg version=\"1.1\" fill=\"white\" xmlns=\"http://www.w3.org/2000/svg\" xmlns:xlink=\"http://www.w3.org/1999/xlink\" x=\"0px\" y=\"0px\" viewBox=\"0 0 215.35 215.35\" style=\"enable-background:new 0 0 215.35 215.35;\" xml:space=\"preserve\"><g><path d=\"M7.5,65.088c4.143,0,7.5-3.358,7.5-7.5V25.61l48.305,48.295c1.465,1.464,3.384,2.196,5.303,2.196c1.92,0,3.84-0.732,5.304-2.197c2.929-2.929,2.929-7.678-0.001-10.606L25.604,15.002h31.985c4.142,0,7.5-3.358,7.5-7.5c0-4.142-3.357-7.5-7.5-7.5H7.5c-4.143,0-7.5,3.358-7.5,7.5v50.087C0,61.73,3.357,65.088,7.5,65.088z\"/><path d=\"M207.85,150.262c-4.143,0-7.5,3.358-7.5,7.5v31.979l-49.792-49.792c-2.93-2.929-7.678-2.929-10.607,0c-2.929,2.929-2.929,7.678,0,10.606l49.791,49.791h-31.977c-4.143,0-7.5,3.358-7.5,7.5c0,4.142,3.357,7.5,7.5,7.5h50.086c4.143,0,7.5-3.358,7.5-7.5v-50.084C215.35,153.62,211.992,150.262,207.85,150.262z\"/><path d=\"M64.792,139.949L15.005,189.74v-31.978c0-4.142-3.357-7.5-7.5-7.5s-7.5,3.358-7.5,7.5v50.086c0,4.142,3.357,7.5,7.5,7.5h50.084c4.142,0,7.5-3.358,7.5-7.5s-3.357-7.5-7.5-7.5H25.611l49.788-49.793c2.929-2.929,2.929-7.678-0.001-10.607C72.471,137.02,67.722,137.02,64.792,139.949z\"/><path d=\"M207.85,0.002h-50.086c-4.143,0-7.5,3.358-7.5,7.5c0,4.142,3.357,7.5,7.5,7.5h31.979l-48.298,48.301c-2.929,2.929-2.929,7.678,0.001,10.607c1.464,1.464,3.384,2.196,5.303,2.196c1.919,0,3.839-0.733,5.304-2.197l48.298-48.301v31.98c0,4.142,3.357,7.5,7.5,7.5c4.143,0,7.5-3.358,7.5-7.5V7.502C215.35,3.359,211.992,0.002,207.85,0.002z\"/></g></svg>\
                </button>",
                opcional: true,
                tooltip: this.i18n.fullscreen
            },
            {
                name: "Main Submenu",
                element: "<div style='display:none;' class='moovie_submenu menuclosed' id='moovie_submenu_" + randomID + "'></div>",
                opcional: false,
                tooltip: false
            }
        ];

        // Main submenu object
        var submenu = this.submenu = {
            mainSubmenu: {
                mainElement: "<ul id='moovie_submenu_main_" + randomID + "'></ul>",
                parentID: "moovie_submenu_main_",
                elements: [{
                        name: "topic",
                        element: "<li class='topic_submenu'>" + this.i18n.main_topic + "</li>",
                        opcional: false
                    },
                    {
                        name: "submenuCaptions",
                        element: "<li id='this.moovie_el_topicCaption_" + randomID + "'><span>" + this.i18n.main_caption + "</span><span class='option_submenu' id='option_submenu_caption_" + randomID + "'>" + this.i18n.main_disabled + "</span></li>",
                        opcional: true
                    },
                    {
                        name: "submenuOffset",
                        element: "<li id='moovie_el_capoffset_" + randomID + "'><span >" + this.i18n.main_offset + "</span><span class='option_submenu' id='option_submenu_range_" + randomID + "'>0s</span></li>",
                        opcional: true
                    },
                    {
                        name: "submenuSpeed",
                        element: "<li id='topic_submenu_speed_" + randomID + "'><span>" + this.i18n.main_speed + "</span><span class='option_submenu' id='option_submenu_speed_" + randomID + "'>" + this.i18n.main_default + "</span></li>",
                        opcional: true
                    }
                ]
            },
            captionSubmenu: {
                mainElement: "<ul style='display:none;' id='moovie_submenu_captions_" + randomID + "'><input style='display:none;' type='file' id='localsub_" + randomID + "'><li class='topic_submenu'>" + this.i18n.caption_topic + "</li><li id='moovie_el_capback_" + randomID + "' style='font-weight:bold;'>" + this.i18n.caption_back + "</li></ul>",
                parentID: "moovie_submenu_captions_",
                elements: [{
                    name: "allowLocalSubtitles",
                    element: "<li id='locally_" + randomID + "' style='font-weight:bold;'>" + this.i18n.caption_load + "</li>",
                    opcional: true
                }]
            },
            rangeSubmenu: {
                mainElement: "<ul style='display:none; width:250px;' id='moovie_range_captions_" + randomID + "'><li class='topic_submenu'>" + this.i18n.offset_topic + "<output style='position:absolute; right:22px;' id='valoffset_" + randomID + "'>0</output></li><li class='topic_submenu'><span>-5s</span><span style='float: right;'>+5s</span><input type='range' oninput='valoffset_" + randomID + ".value = offset_range_input_" + randomID + ".value' id='offset_range_input_" + randomID + "' min='-5' max='5' step='0.2'></li>",
                parentID: "moovie_range_captions_",
            },
            speedSubmenu: {
                mainElement: "<ul style='display:none; width:250px;' id='moovie_range_speed_" + randomID + "'><li class='topic_submenu'>" + this.i18n.speed_topic + "<output style='position:absolute; right:22px;' id='valoffset_speed_" + randomID + "'>1</output></li><li class='topic_submenu'><span>0.1x</span><span style='float: right;'>8x</span><input type='range' value='1' oninput='valoffset_speed_" + randomID + ".value = offset_range_speed_" + randomID + ".value' id='offset_range_speed_" + randomID + "' min='0.1' max='8' step='0.1'></li>",
                parentID: "moovie_range_speed_"
            }
        }

        /*
         ** Custom Events
         */

        // Caption Change
        let captionchange = new CustomEvent("captionchange", {
            detail: this.events.captions,
            bubbles: false,
            cancelable: false,
            composed: false
        });

        // Caption Offset Change
        let offsetchange = new CustomEvent("offsetchange", {
            detail: this.events.offset,
            bubbles: false,
            cancelable: false
        });

        // Caption toggle
        let togglecaption = new CustomEvent("togglecaption", {
            detail: this.events.captions,
            bubbles: false,
            cancelable: false
        });

        // Control Panel toggle
        var togglecontrolpanel = new CustomEvent("togglecontrolpanel", {
            detail: {
                show: false
            },
            bubbles: false,
            cancelable: false
        });

        /*
         ** Main throttle function
         */
        function throttle(func, interval) {
            var timeout;
            return function() {
                var context = this,
                    args = arguments;
                var later = function() {
                    timeout = false;
                };
                if (!timeout) {
                    func.apply(context, args)
                    timeout = true;
                    setTimeout(later, interval)
                }
            }
        }

        /*
         ** function to set new current time
         */
        function SetCurrentTime(currentT) {
            _this.video.currentTime = currentT;
            _this.moovie_el_progressbar.value = currentT;
        }

        /*
         ** function that handles custom events
         */
        var handleCustomEvents = this.handleCustomEvents = function handleCustomEvents() {

            // Loop all events
            for (var i = 0; i < customEvents.length; i++) {

                let toGo = customEvents[i].to;
                let eventID = Math.floor(Math.random() * (9999 - 0 + 1)) + 0;

                if (customEvents[i].hasOwnProperty("fired") && customEvents[i].fired) {

                    // Remove event after its time
                    if (video.currentTime > customEvents[i].endtime) {
                        customEvents[i].fired = false;
                        document.getElementById("moovie_ce_" + customEvents[i].eventID).remove();
                    }

                } else {

                    if (video.currentTime > customEvents[i].starttime && video.currentTime < customEvents[i].endtime) {
                        // Assign new keys and infos
                        Object.assign(customEvents[i], { fired: true });
                        Object.assign(customEvents[i], { eventID: eventID });

                        moovie_el_video.insertAdjacentHTML("beforeend", "<div id='moovie_ce_" + eventID + "' class='moovie_cevent " + customEvents[i].position + " " + customEvents[i].class + "'>" + customEvents[i].content + "</div>");
                        let eventElement = document.getElementById("moovie_ce_" + eventID);

                        // Check what type of button it is and give it's instructions
                        switch (customEvents[i].type) {
                            case "skip":
                                if (customEvents[i].to <= video.duration && !isNaN(customEvents[i].to) && customEvents[i].to) {
                                    // Add Skip event listener
                                    eventElement.addEventListener("click", function() {
                                        SetCurrentTime(toGo)
                                    });
                                }
                                break;
                            case "redirect":
                                if (customEvents[i].to) {
                                    // Add Redirect event listener
                                    eventElement.addEventListener("click", function() {
                                        window.location.href = toGo;
                                    });
                                }
                                break;
                            case "function":
                                if (customEvents[i].to) {
                                    // Add Redirect event listener
                                    eventElement.addEventListener("click", function() {
                                        toGo();
                                    });
                                }
                                break;
                            default:
                                console.log("No action was added to this event");
                        }
                    }
                }
            }
        }

        /*
         ** function that handles internal storage
         */
        var handleStorage = this.handleStorage = function handleStorage(order, variable, value) {
            switch (order) {
                case "set":
                    localStorage.setItem(variable, value);
                    break;
                case "get":
                    break;
                case "setStorage":
                    if (config["storage"]["captionOffset"]) {
                        moovie_el_rinput.value = localStorage.getItem("captionOffset");
                        OffsetChange();
                    }
                    if (config["storage"]["playrateSpeed"]) {
                        moovie_el_sinput.value = localStorage.getItem("playrateSpeed");
                        SpeedChange();
                    }
                    if (config["storage"]["captionSize"]) { document.getElementById("caption_track_" + randomID).style.fontSize = localStorage.getItem("captionSize") + "px"; }
                    break;
            }
        }

        /*
         ** Change play/pause function and change all icons
         */
        var togglePlay = this.togglePlay = function togglePlay() {

            // Remove poster background.
            document.getElementById("poster_layer_" + randomID).style.backgroundImage = "none";
            if (video.paused == true) {
                video.play();
                document.getElementById("moovie_bplay_play_" + randomID).style.display = "none";
                document.getElementById("moovie_bplay_pause_" + randomID).style.display = "inherit";
                togglePoster("hide");
                ChangeTooltip("play_button", 1);
            } else {
                video.pause();
                document.getElementById("moovie_bplay_play_" + randomID).style.display = "inherit";
                document.getElementById("moovie_bplay_pause_" + randomID).style.display = "none";
                togglePoster("show");
                ChangeTooltip("play_button", 0);
            }
        }

        /*
         ** Fullscreen handler
         */
        var SetFullScreen = this.SetFullScreen = function SetFullScreen(order) {
            switch (order) {
                case "toggleFullscreen":

                    if (moovie_el_player.requestFullscreen) {
                        moovie_el_player.requestFullscreen();
                    } else if (moovie_el_player.webkitRequestFullscreen) { // Safari
                        moovie_el_player.webkitRequestFullscreen();
                    } else if (moovie_el_player.msRequestFullscreen) { // IE11
                        moovie_el_player.msRequestFullscreen();
                    }

                    ChangeTooltip("fullscreen", 1);

                    if (1 >= outerHeight - innerHeight) {
                        if (document.exitFullscreen) {
                            document.exitFullscreen();
                        } else if (document.webkitExitFullscreen) { // Safari
                            document.webkitExitFullscreen();
                        } else if (document.msExitFullscreen) { // IE11
                            document.msExitFullscreen();
                        }

                        ChangeTooltip("fullscreen", 0);
                    }

                    Submenu("CAll");

                    break;
                case "checkFullscreen":
                    if (1 >= outerHeight - innerHeight) { ChangeTooltip("fullscreen", 1); } else { ChangeTooltip("fullscreen", 0); }
                    break;
                default:
            }
        }

        /*
         ** Buffered Video
         */
        function bufferedVideo() {

            // Canvas element
            var canvasHandler = moovie_el_buffered.getContext('2d');
            var b = _this.video.buffered, // Buffer object
                i = b.length, // counter for loop
                w = moovie_el_buffered.width, // cache canvas width and height
                h = moovie_el_buffered.height,
                vl = _this.video.duration, // total video duration in seconds
                x1, x2; // buffer segment mark positions

            // Clear canvas
            canvasHandler.clearRect(0, 0, w, h);
            // Color for loaded buffer(s)
            canvasHandler.fillStyle = '#e1e1dd';

            // Iterate through buffers
            while (i--) {
                x1 = b.start(i) / vl * w;
                x2 = b.end(i) / vl * w;
                canvasHandler.fillRect(x1, 0, x2 - x1, h);
            }
            setTimeout(bufferedVideo, 500);
        }

        /*
         ** Focus player to add keybinds
         */
        function focusPlayer() { video.focus(); }

        /*
         ** Toggle Poster
         */
        function togglePoster(order) {
            if (order == "show") {
                moovie_el_poster.style.display = "block";
                moovie_el_poster.classList.remove("posteroff");
                moovie_el_poster.classList.add("posteron");
            } else if (order == "hide") {
                moovie_el_poster.style.display = "none";
                moovie_el_poster.classList.remove("posteron");
                moovie_el_poster.classList.add("posteroff");
            }
        }

        /*
         ** Skips video on click
         */
        function skip() {
            video.currentTime += parseFloat(this.dataset.skip);
        }

        /*
         ** Range value update
         */
        function handleRangeUpdate() {
            video[this.name] = this.value;
        }

        /*
         ** Current time handler
         */
        function movieVideo(time, direction) {
            switch (direction) {
                case "left":
                    var vid_currentTime = video.currentTime;
                    video.currentTime = vid_currentTime - time;
                    var ncurrentTime = moovie_el_progress.value;
                    moovie_el_progress.value = Number(ncurrentTime) - 5;
                    break;
                case "right":
                    var vid_currentTime = video.currentTime;
                    video.currentTime = vid_currentTime + time;
                    var ncurrentTime = moovie_el_progress.value;
                    moovie_el_progress.value = Number(ncurrentTime) + 5;
                    break;
            }
        }

        /*
         ** Slide position
         */
        function calcSliderPos(e) {
            return (e.offsetX / e.target.clientWidth) * parseInt(e.target.getAttribute('max'));
        }

        /*
         ** Progress bar cue timer function
         */
        function cueTime(e) {
            cuevalue = calcSliderPos(e).toFixed(2);
            moovie_el_cuetimer.style.opacity = "1";
            moovie_el_cuetimer.style.left = e.offsetX + "px";
            moovie_el_cuetimer.innerHTML = player_time(cuevalue);
        }

        /*
         ** Detect touchscreen function so it can be added diff eventlisteners
         */
        function detectTouchScreen() {
            var isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
            return isMobile;
        }

        /*
         ** Detect OS
         */
        function androidOrIOS() {
            const userAgent = navigator.userAgent;
            if (/android/i.test(userAgent)) {
                return 'android';
            }
            if (/iPad|iPhone|iPod/i.test(userAgent)) {
                return 'ios';
            }
        }

        /*
         ** Format player time
         */
        function player_time(secs) {
            var t = new Date(1970, 0, 1);
            t.setSeconds(secs);
            var s = t.toTimeString().substr(0, 8);
            if (secs > 86399) {
                s = Math.floor((t - Date.parse("1/1/70")) / 3600000) + s.substr(2);
            }

            // Check if has less than a hour, if yes, remove hour digits
            if (secs < 3600) { s = s.substring(3); }

            return s;
        }

        /*
         ** Update moovie time on "timeupdate" event listener
         */
        function updateTime() {
            // Update current times
            if (moovie_ishiden == 0) { document.getElementById("moovie_currentime_" + randomID).innerHTML = player_time(video.currentTime); }
            if (video.currentTime >= video.duration) {
                video.currentTime = 0;
                moovie_el_progress.value = 0;
                togglePlay();
            }
        }

        /*
         ** Handle local subtitles
         */
        function localSubtitles() {

            const allowedFormats = [".vtt", ".srt"];
            const toBase64 = file => new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.readAsDataURL(file);
                reader.onload = () => resolve(reader.result);
                reader.onerror = error => reject(error);
            });

            let promise = new Promise(async function(resolve, reject) {

                const file = document.querySelector('#localsub_' + randomID).files[0];
                var CheckFormat = file["name"].substr(file["name"].length - 4);

                // Check if format is allowed
                if (allowedFormats.includes(CheckFormat)) {
                    document.querySelectorAll('#moovie_submenu_captions_' + randomID + ' .caption_track').forEach((item) => { item.remove(); });
                    const CaptionSrc = await toBase64(file);
                    let tname = file["name"].substring(0, 10);
                    document.getElementById(selector).insertAdjacentHTML("beforeend", "<track label='" + tname + "...' format='" + CheckFormat + "' srclang='Local' src='" + CaptionSrc + "'>");

                    resolve();

                } else { console.log("Only .vtt and .srt formats are allowed."); }
            });
            promise.then(function() {
                GetCaptions();
                console.log("Local caption added successfully.");
            });
        }

        /*
         ** Progress bar
         */
        var handleProgress = throttle(function() {

            // Get percentage buffered
            bufferedVideo();

            // Set current time moovie_el_progressbar
            if (!video.paused) {
                var ncurrentTime = moovie_el_progress.value;
                moovie_el_progress.value = Number(ncurrentTime) + 1;
            }

        }, 1000);

        /*
         ** Offset change function
         */
        var OffsetChange = this.OffsetChange = function OffsetChange() {
            offsettime = document.getElementById("offset_range_input_" + randomID).value;
            document.getElementById("option_submenu_range_" + randomID).innerHTML = offsettime + "s";
            document.getElementById("valoffset_" + randomID).value = offsettime;

            // Save info in internal storage if true
            if (config["storage"]["captionOffset"]) { handleStorage("set", "captionOffset", offsettime); }

            // Update object to event listener
            _this.events.offset.value = offsettime;

            // Dispatch event listener
            _this.video.dispatchEvent(offsetchange);
        }

        /*
         ** Speed change functions
         */
        var SpeedChange = this.SpeedChange = function SpeedChange() {
            speed = document.getElementById("offset_range_speed_" + randomID).value;
            document.getElementById("valoffset_speed_" + randomID).value = speed;

            if (speed == 1) { document.getElementById("option_submenu_speed_" + randomID).innerHTML = _this.i18n.main_default; } else {
                document.getElementById("option_submenu_speed_" + randomID).innerHTML = speed + "x";
            }

            video.playbackRate = speed;

            // Save info in internal storage if true
            if (config["storage"]["playrateSpeed"]) { handleStorage("set", "playrateSpeed", speed); }
        }

        /*
         ** Handler progress bar click/mousemove/touch events
         */
        function Scrub(e) {

            if (!detectTouchScreen()) {
                var offsetEvent = e.offsetX;
                let scrubTime = (offsetEvent / moovie_elprogress.offsetWidth) * video.duration;
                if (scrubTime >= video.duration) { scrubTime = video.duration; }
                video.currentTime = scrubTime;
            } else {
                var offsetEvent = document.getElementById("range_progress_" + randomID).value;

                if (offsetEvent == undefined) {
                    offsetEvent = e.touches[0].clientX;
                    let scrubTime = (offsetEvent / moovie_elprogress.offsetWidth) * video.duration;
                    if (scrubTime >= video.duration) { scrubTime = video.duration; }
                    video.currentTime = scrubTime;
                } else {
                    video.currentTime = offsetEvent;
                }
            }
        }

        /*
         ** Handler progress bar click/mousemove/touch events
         */
        function ScrubSound(e) {
            video.volume = moovie_ul_soundv.value;
            // Save Sound variable
            handleStorage("set", "scrubsound", video.volume);
            checkSoundLevel("checkMute");
        }

        /*
         ** Hide Controls
         */
        function HideControls(order) {
            if (order == "close") {
                if (isopen == 0 && video.paused == false) {
                    Submenu("CAll");
                    document.getElementById("moovie__controls_" + randomID).style.opacity = 0;
                    document.getElementById("caption_track_" + randomID).style.marginBottom = "0px";
                    togglecontrolpanel.detail.show = false;
                    _this.video.dispatchEvent(togglecontrolpanel);
                }
            } else if (order == "open") {

                // Check if video is fully loaded, to it can display the control bar
                if (fullyloaded == 1) {
                    document.getElementById("caption_track_" + randomID).style.marginBottom = "40px";
                    document.getElementById("moovie__controls_" + randomID).style.opacity = 1;
                    togglecontrolpanel.detail.show = true;
                    _this.video.dispatchEvent(togglecontrolpanel);
                }
            }
        }

        /*
         ** Change Tooltip
         */
        var ChangeTooltip = _this.ChangeTooltip = function ChangeTooltip(elemName, defaultState) {

            // Get tooltip element
            let ele = _this.tooltips_menu[elemName].element;
            var toolText = 0;
            for (var i = 0; i < _this.mainmenu.length; i++) {
                if (_this.mainmenu[i].name == elemName)
                    toolText = _this.mainmenu[i].tooltip;
            }

            // Check for brackets
            if (toolText.indexOf('(') > -1) {
                // Get everything between brackets
                var betweenBrackets = toolText.substring(toolText.lastIndexOf("(") + 1, toolText.lastIndexOf(")"));
                parts = betweenBrackets.split(":");

                // Remove everything between brackets
                var getNumBracketsString = toolText.replace(/\(.*\)/, '');
                getNumBracketsString = getNumBracketsString.replace(" ", "");

                // Final tootip
                var finalTooltip = parts[defaultState] + " " + getNumBracketsString;
            }

            if (finalTooltip)
                ele.innerText = finalTooltip;

            // Calculates the offset position of the tooltip
            let calculatePos = (ele.offsetWidth / 2) - 7;
            ele.style.marginLeft = "-" + calculatePos + "px";

            // Check overflow (max) 
            if ((ele.offsetLeft + ele.offsetWidth) >= _this.moovie_el_controlbar.offsetWidth) {

                // calculates how much it has overflowed 
                let getOverflows = (ele.offsetLeft + ele.offsetWidth) - _this.moovie_el_controlbar.offsetWidth;
                getOverflows = (calculatePos + getOverflows) + 5; // plus 10 for margin
                ele.style.marginLeft = "-" + getOverflows + "px";

            }
            // Check overflow (min) 
            if (ele.offsetLeft <= 0) {
                ele.style.marginLeft = "-19px";
            }

        }

        /*
         ** Activate Subtitles
         */
        var ActivateSubtitles = this.ActivateSubtitles = function ActivateSubtitles() {
            if (hassubtitles == 1) {
                if (subtitles == 0) {
                    subtitles = 1;
                    document.getElementById("moovie_subtitle_svg_" + randomID).classList.remove("opacity_svg");
                    ChangeTooltip("subtitles", 1);

                    // Update object to event listener
                    _this.events.captions.subtitles = true;

                } else if (subtitles == 1) {
                    subtitles = 0;
                    document.getElementById("moovie_subtitle_svg_" + randomID).classList.add("opacity_svg");
                    ChangeTooltip("subtitles", 0);

                    // Update object to event listener
                    _this.events.captions.subtitles = false;
                }
            } else {
                console.log("You must choose an Subtitle first.");
            }

            // Dispatch event listener
            _this.video.dispatchEvent(togglecaption);
        }

        /*
         ** Sound overall handler
         */
        var checkSoundLevel = this.checkSoundLevel = function checkSoundLevel(order) {
            switch (order) {

                case "checkMute":

                    if (video.muted || video.volume == 0) {

                        video.muted = false;
                        moovie_ul_soundv.value = localStorage.getItem("scrubsound");
                        video.volume = localStorage.getItem("scrubsound");
                        document.getElementById("icon_volume_unmute_" + randomID).style.display = "none";
                        document.getElementById("icon_volume_mute_" + randomID).style.display = "inherit";
                        ChangeTooltip("mute", 1);

                    } else {
                        document.getElementById("icon_volume_unmute_" + randomID).style.display = "inherit";
                        document.getElementById("icon_volume_mute_" + randomID).style.display = "none";
                        ChangeTooltip("mute", 0);
                    }

                    break;
                case "toogleMute":
                    if (video.muted == true) { checkSoundLevel("unmutePlayer"); } else { checkSoundLevel("mutePlayer"); }
                    break;
                case "checkStorage":

                    if (localStorage.getItem("scrubsound")) {
                        moovie_ul_soundv.value = localStorage.getItem("scrubsound");
                        video.volume = localStorage.getItem("scrubsound");
                    } else {
                        moovie_ul_soundv.value = "1";
                        video.muted = false;
                        handleStorage("set", "scrubsound", 1);
                    }
                    checkSoundLevel("checkMute");

                    break;
                case "mutePlayer":

                    video.muted = true;
                    video.volume = 0;
                    document.getElementById("icon_volume_unmute_" + randomID).style.display = "none";
                    document.getElementById("icon_volume_mute_" + randomID).style.display = "inherit";
                    document.getElementById("mooviegrid_volume_" + randomID).value = "0";
                    ChangeTooltip("mute", 1);
                    break;
                case "unmutePlayer":

                    video.muted = false;

                    checkSoundLevel("checkMute");
                    if (localStorage.getItem("scrubsound")) {
                        moovie_ul_soundv.value = localStorage.getItem("scrubsound");
                    } else {
                        moovie_ul_soundv.value = "1";
                    }
                    ChangeTooltip("mute", 0);

                    if (video.volume != 0)
                        document.getElementById("icon_volume_unmute_" + randomID).style.display = "inherit";
                    document.getElementById("icon_volume_mute_" + randomID).style.display = "none";

                    break;
                default:
            }
        }

        /*
         ** Submenu handler function
         */
        var Submenu = this.Submenu = function Submenu(order) {
            switch (order) {

                case "toggleSubmenu": // Close caption menu

                    // Close all other submenus
                    moovie_el_submain.style.display = "block";
                    moovie_el_captions.style.display = "none";
                    moovie_el_speed.style.display = "none";
                    moovie_el_range.style.display = "none";

                    // Open mainsubmenu
                    if (moovie_el_submenu.classList.contains("menuclosed")) {
                        moovie_el_submenu.style.display = "block";
                        moovie_el_submenu.classList.add("menuopen");
                        moovie_el_submenu.classList.remove("menuclosed");
                        isopen = 1;
                    } else {
                        moovie_el_submenu.style.display = "none";
                        moovie_el_submenu.classList.add("menuclosed");
                        moovie_el_submenu.classList.remove("menuopen");
                        isopen = 0;
                    }

                    break;
                case "CAll": // Close caption menu

                    // Close all other submenus
                    moovie_el_submain.style.display = "none";

                    moovie_el_captions.style.display = "none";
                    moovie_el_speed.style.display = "none";
                    moovie_el_range.style.display = "none";

                    moovie_el_submenu.classList.add("menuclosed");
                    isopen = 0;

                    break;
                case "OCaption": // Open menu caption

                    moovie_el_submain.style.display = "none";
                    moovie_el_captions.style.display = "block";

                    break;
                case "CCaption": // Close caption menu

                    moovie_el_submain.style.display = "block";
                    moovie_el_captions.style.display = "none";

                    break;
                case "OSpeed": // Open menu caption

                    moovie_el_submain.style.display = "none";
                    document.getElementById("moovie_range_speed_" + randomID).style.display = "block";

                    break;
                case "ORange": // Close caption menu

                    moovie_el_submain.style.display = "none";
                    document.getElementById("moovie_range_captions_" + randomID).style.display = "block";

                    break;
                default:

            }
        }

        /*
         ** Responsive Improveness
         */
        var TransformPlayer = this.TransformPlayer = function TransformPlayer(caption) {

            var containerWidth = moovie_el_video.offsetWidth;
            if (containerWidth <= 460) {
                // Set Flag
                moovie_ishiden = 1;
                // Set player transformations
                document.getElementById("moovie_el_current_" + randomID).style.display = "none";
                document.getElementById("moovie_moovie_el_progressbar_" + randomID).classList.add("responsive_bar");
                moovie_el_cuetimer.classList.add("moovie_cuetime_small");

            } else {

                // Set Flag
                moovie_ishiden = 0;
                // Set player transformations
                document.getElementById("moovie_el_current_" + randomID).style.display = "block";
                document.getElementById("moovie_moovie_el_progressbar_" + randomID).classList.remove("responsive_bar");
                document.getElementById("moovie_fulltime_" + randomID).innerHTML = player_time(video.duration);
                moovie_el_cuetimer.classList.remove("moovie_cuetime_small");
            }

        }

        /*
         ** Set caption size when container changes size
         */
        var SetCaptionSize = this.SetCaptionSize = function SetCaptionSize(value) {

            const captionSize = document.getElementById("caption_track_" + randomID);
            var computedFontSize = window.getComputedStyle(captionSize).fontSize;

            if (!value) {
                var containerSize = moovie_el_video.offsetWidth;
                var fontSizeCap = containerSize * 0.10;
                captionSize.style.fontSize = fontSizeCap + "%";
                captionSize.style.lineHeight = (fontSizeCap / 3) + "px";
            } else {

                if (value == "sizeUp") {
                    computedFontSize = computedFontSize.slice(0, -2);
                    computedFontSize = Number(computedFontSize) + Number(1);
                    captionSize.style.fontSize = computedFontSize + "px";

                } else if (value == "sizeDown") {
                    computedFontSize = computedFontSize.slice(0, -2);
                    computedFontSize = Number(computedFontSize) - Number(1);
                    captionSize.style.fontSize = computedFontSize + "px";
                }

                // Save info in internal storage if true
                if (config["storage"]["captionSize"]) { handleStorage("set", "captionSize", computedFontSize); }

            }
        }

        /*
         **  Play Captions
         */
        var PlayCaption = this.PlayCaption = function PlayCaption(caption) {

            // Reset variables
            selectedCaption = [];

            // Format time
            function sec2time(timeInSeconds) {
                var pad = function(num, size) { return ('000' + num).slice(size * -1); },
                    time = parseFloat(timeInSeconds).toFixed(3),
                    hours = Math.floor(time / 60 / 60),
                    minutes = Math.floor(time / 60) % 60,
                    seconds = Math.floor(time - minutes * 60),
                    milliseconds = time.slice(-3);
                return pad(hours, 2) + ':' + pad(minutes, 2) + ':' + pad(seconds, 2) + '.' + pad(milliseconds, 3);
            }

            // Run Caption Logic
            function RunCaption() {

                for (var i = 1; i < selectedCaption.length; i++) {

                    if (selectedCaption[i]['starttime'] != undefined && selectedCaption[i]['endtime'] != undefined) {
                        var cap_starttime = selectedCaption[i]['starttime'];
                        var cap_endtime = selectedCaption[i]['endtime'];

                        if (offsettime >= 0) {
                            var RealcurrentTime = video.currentTime - offsettime;
                        } else {
                            var offsettimeBelow0 = String(offsettime).substring(1);
                            var RealcurrentTime = video.currentTime + Number(offsettimeBelow0);
                        }

                        RealcurrentTime = sec2time(RealcurrentTime);

                        // Add caption if current time is between Start and End
                        if (RealcurrentTime >= cap_starttime && RealcurrentTime <= cap_endtime && subtitles == 1) {

                            // Check if theres a undefined line
                            if (selectedCaption[i]["text2"] != undefined) {
                                document.getElementById("caption_track_" + randomID).innerHTML = selectedCaption[i]['text1'] + "<br>" + selectedCaption[i]['text2'];
                            } else {
                                document.getElementById("caption_track_" + randomID).innerHTML = selectedCaption[i]['text1'];
                            }
                        }

                        // After current time passes it removes caption
                        if (RealcurrentTime > cap_endtime) { document.getElementById("caption_track_" + randomID).innerHTML = ""; }
                    }
                }
            }

            // Loop trought selected VTT
            var request = new XMLHttpRequest();
            request.open('GET', caption["attributes"]["src"]["nodeValue"], true);

            // Check if it has format attribute, if yes, came via local
            if (caption["attributes"]["format"]) {
                var capFormat = caption["attributes"]["src"]["nodeValue"] + caption["attributes"]["format"]["nodeValue"];
            } else {
                var capFormat = caption["attributes"]["src"]["nodeValue"];
            }

            // Update object to event listener
            _this.events.captions.name = caption["attributes"]["label"]["nodeValue"];

            request.onload = function() {
                if (this.status >= 200 && this.status < 400) {

                    var resp = this.response;
                    resp = resp.replace(/(\r\n|\r|\n)/g, '\n');

                    // if it is .SRT format, add a cue to the beginning of the file to match VTT style
                    var CheckFormat = capFormat.substr(capFormat.length - 4);
                    if (CheckFormat == '.srt') { resp = "STR\n\n" + resp; }

                    resp.split("\n\n").map(function(item) {

                        parts = item.split("\n");

                        if (parts[1] != undefined) {

                            if (isNaN(parts[0])) { // If VTT Doesnt have cue number

                                var timeString = parts[0].replace(/-/g, '');
                                var checkEmptyString = timeString;
                                checkEmptyString = checkEmptyString.replace(/ /g, '');

                                if (checkEmptyString) {
                                    if (CheckFormat == '.srt') { timeString = parts[0].replace(/,/g, '.'); }

                                    // Get starttime
                                    var starttime = timeString.substr(0, timeString.indexOf('>'));
                                    starttime = starttime.replace(/ /g, '');

                                    // Get endtime
                                    var endtime = timeString.split('>', 2);
                                    endtime = endtime[1].replace(/ /g, '');

                                    starttime = starttime.replace(/--/g, '');
                                    endtime = endtime.replace(/--/g, '');

                                    // If it is .srt, change ","" to ".""
                                    if (CheckFormat == '.srt') {
                                        endtime = endtime.replace(/,/g, '.');
                                        starttime = starttime.replace(/,/g, '.');
                                    }

                                    // Push array with all info
                                    selectedCaption.push(({ 'starttime': starttime, 'endtime': endtime, 'text1': parts[1], 'text2': parts[2] }));
                                }

                            } else {

                                var timeString = parts[1].replace(/-/g, '');
                                var checkEmptyString = timeString;
                                checkEmptyString = checkEmptyString.replace(/ /g, '');

                                if (checkEmptyString) {
                                    // Get starttime
                                    var starttime = timeString.substr(0, timeString.indexOf('>'));
                                    starttime = starttime.replace(/ /g, '');

                                    // Get endtime
                                    var endtime = timeString.split('>', 2);
                                    endtime = endtime[1].replace(/ /g, '');

                                    // If it is .srt, change ","" to ".""
                                    if (CheckFormat == '.srt') {
                                        endtime = endtime.replace(/,/g, '.');
                                        starttime = starttime.replace(/,/g, '.');
                                    }

                                    // Push array with all info
                                    selectedCaption.push(({ 'starttime': starttime, 'endtime': endtime, 'text1': parts[2], 'text2': parts[3] }));
                                }
                            }

                        } else {

                            // Push array with all info
                            selectedCaption.push(({ 'starttime': undefined, 'endtime': undefined, 'text1': undefined, 'text2': undefined }));

                        }
                    })
                }
            }

            request.send();

            // Run caption
            video.addEventListener('timeupdate', RunCaption, true);
            if (hassubtitles == 1) { video.removeEventListener('timeupdate', RunCaption, true); } else {

                // Set flag on hassubtitles
                hassubtitles = 1;
                ActivateSubtitles();

            }

            // Dispatch event listener
            _this.video.dispatchEvent(captionchange);
        }

        /*
         ** Add Captions
         */
        var SetCaptions = this.SetCaptions = function SetCaptions(caption) {

            // Get Caption Format
            let CaptionFormat = caption["attributes"]["src"]["nodeValue"].substr(caption["attributes"]["src"]["nodeValue"].length - 4);
            let capLabel = caption['track']['label'];
            // Generating a random ID for each caption
            var captionIDRandom = Math.floor(Math.random() * (9999 - 0 + 1)) + 0;

            if (caption["attributes"]["format"]) { CaptionFormat = caption["attributes"]["format"]["nodeValue"]; }

            // Add caption to list and add event listener to play it
            moovie_el_captions.insertAdjacentHTML('beforeend', "<li class='caption_track' id='captionid_" + captionIDRandom + "'><span>" + capLabel + "</span><span class='labelformat'>" + CaptionFormat + "</span></li>");
            document.getElementById("captionid_" + captionIDRandom).addEventListener("click", function() {
                PlayCaption(caption);
                document.getElementById("option_submenu_caption_" + randomID).innerHTML = capLabel;
                Submenu("toggleSubmenu"); // Close menu
            });
        }

        /*
         ** Get Captions
         */
        var GetCaptions = this.GetCaptions = function GetCaptions() {

            // Get all captions inside video tag
            var vcaptions = document.getElementById(_this.selector).getElementsByTagName('track');
            for (var i = 0; i < vcaptions.length; i++) {
                _this.SetCaptions(vcaptions[i]);
            }
        }

        /*
         ** Keybinds
         */
        var Keybinds = this.Keybinds = function Keybinds() {

            // Accepted shortcuts
            const acceptedShortcuts = {
                keycode_32() { togglePlay(); }, // [Space Bar]
                keycode_75() { togglePlay(); }, // [K]
                keycode_70() { SetFullScreen("toggleFullscreen"); }, // [F]
                keycode_39() { movieVideo(5, "right"); }, // [Right Arrow]
                keycode_37() { movieVideo(5, "left"); }, // [Left Arrow]
                keycode_77() { checkSoundLevel("toogleMute"); }, // [M]
                keycode_67() { ActivateSubtitles(); }, // [C]
                keycode_shift87() { SetCaptionSize("sizeUp"); }, // [Shift + W]
                keycode_shift83() { SetCaptionSize("sizeDown"); } // [Shift + S]
            }

            // Listen to keyboard
            video.addEventListener('keydown', function(event) {
                let ShortCut;
                if (event.keyCode == 32 || event.shiftKey && event.keyCode == 87 || event.shiftKey && event.keyCode == 83) { event.preventDefault(); }
                if (event.shiftKey) { ShortCut = acceptedShortcuts['keycode_shift' + event.keyCode]; } else { ShortCut = acceptedShortcuts['keycode_' + event.keyCode]; }
                if (ShortCut) ShortCut();
            });
        }

        /*
         ** Setup Events
         */
        var SetupLogic = this.SetupLogic = function SetupLogic() {

            // Get elements
            moovie_el_player = document.querySelector('#moovie__video_' + randomID);
            video = moovie_el_player.querySelector("#moovie_vid_" + randomID);
            this.video = video;

            // Wait media to load, to make sure it doesnt add eventlisteners to a empty container
            video.addEventListener('loadedmetadata', e => {

                // Hide loading screen
                this.medialoading.style.display = "none";
                moovie_el_controls.style.opacity = 1;
                fullyloaded = 1;

                // Update movie direction
                moovie_el_progress.setAttribute("max", video.duration);

                if (moovie_ishiden == 0) {
                    document.getElementById("moovie_fulltime_" + randomID).innerHTML = player_time(video.duration);
                }

                // Get buffered video
                bufferedVideo();
                // Call funtion to set values in the Localstore
                handleStorage("setStorage");
                // Check stored sound level
                checkSoundLevel("checkStorage");
            });

            video.addEventListener('timeupdate', handleProgress);
            video.addEventListener('timeupdate', updateTime);

            // CustomEvents listener
            video.addEventListener('timeupdate', handleCustomEvents);

            // Focus player so we can add bindings
            moovie_el_player.addEventListener('click', focusPlayer);

            // FullScreen
            fullscreen = moovie_el_player.querySelector(".fullscreen_button");
            fullscreen.addEventListener("click", function() { SetFullScreen("toggleFullscreen"); }, true);
            document.addEventListener("fullscreenchange", function() { SetFullScreen("checkFullscreen"); }, true);

            // Toogle Functions
            moovie_el_toggle = moovie_el_player.querySelector('.toggle');
            moovie_el_toggle.addEventListener('click', togglePlay);

            // Ranges & Sliders
            ranges = moovie_el_player.querySelectorAll('.player__slider');
            ranges.forEach(range => range.addEventListener('change', handleRangeUpdate));
            this.moovie_el_rangeinput.addEventListener('change', OffsetChange);
            this.moovie_el_speedinput.addEventListener('change', SpeedChange);

            // volume element 
            moovie_ul_soundv = document.getElementById("mooviegrid_volume_" + randomID);

            // Mute
            document.getElementById("mooviegrid_mute_" + randomID).addEventListener("click", function() { checkSoundLevel("toogleMute"); }, false);

            // Progress bar
            moovie_elprogress = moovie_el_player.querySelector('.moovie_progress');

            // Submenu events
            this.control_buttons.config.addEventListener("click", function() { Submenu("toggleSubmenu") }, true);
            this.moovie_el_topicCaption.addEventListener("click", function() { Submenu("OCaption") }, true);
            this.moovie_el_topicSpeed.addEventListener("click", function() { Submenu("OSpeed") }, true);
            this.moovie_el_capback.addEventListener("click", function() { Submenu("CCaption") }, true);
            this.control_buttons.subtitles.addEventListener("click", ActivateSubtitles);
            moovie_el_video.addEventListener("mouseleave", function() { Submenu("CAll") }, false);
            this.moovie_el_capoffset.addEventListener("click", function() { Submenu("ORange") }, true);

            if (!detectTouchScreen()) {

                // Mouse related eventListeners
                let mousedown = false;
                moovie_elprogress.addEventListener('click', Scrub);
                moovie_elprogress.addEventListener('mousemove', (e) => mousedown && Scrub(e));

                // Volume EventListeners
                moovie_ul_soundv.addEventListener('click', ScrubSound);
                let mousedowns = false;
                moovie_ul_soundv.addEventListener('mousemove', (e) => mousedowns && ScrubSound(e));
                moovie_ul_soundv.addEventListener('mousedown', () => mousedowns = true);
                moovie_ul_soundv.addEventListener('mouseup', () => mousedowns = false);

                // Poster Functions
                moovie_el_poster = moovie_el_player.querySelector('#poster_layer_' + randomID);
                moovie_el_poster.addEventListener('click', togglePlay);
                video.addEventListener('click', togglePlay);

                // Event listener for LocalSubtitles
                moovie_el_locally.addEventListener("click", function() { moovie_el_localsub.click(); }, true);
                moovie_el_localsub.addEventListener('change', localSubtitles);

                // Cue Time
                document.getElementById('range_progress_' + randomID).addEventListener('mousemove', function(e) { cueTime(e); });
                document.getElementById('range_progress_' + randomID).addEventListener('mouseleave', function(e) { moovie_el_cuetimer.style.opacity = 0; });

                moovie_elprogress.addEventListener('mousedown', () => mousedown = true);
                moovie_elprogress.addEventListener('mouseup', () => mousedown = false);

                moovie_el_controls.addEventListener('mouseover', e => { isopen = 1; });
                moovie_el_controls.addEventListener('mouseleave', e => { isopen = 0; });

                moovie_el_progress.addEventListener("input", function(event) { video.pause(); }, false);
                moovie_el_progress.addEventListener("change", function(event) {
                    togglePlay();
                    togglePoster("hide");
                }, false);

                // Hide div on mouse stop
                HideControls("close");
                var i = null;
                moovie_el_video.addEventListener('mousemove', e => {
                    clearTimeout(i);
                    HideControls("open");
                    i = setTimeout(function() { HideControls("close"); }, 2000);
                });
                moovie_el_video.addEventListener('mouseleave', e => {
                    clearTimeout(i);
                    HideControls("close");
                });

            } else {

                // Check if it is Android or iOs
                if (androidOrIOS() == "ios") {
                    // Since iOs doesnt support Fullscreen and Volume changes, let's hide it
                    this.moovie_el_volume.style.display = "none";
                    fullscreen.style.display = "none";
                    video.style.transformStyle = "preserve-3d";
                }

                // Touch related eventListeners
                moovie_el_progress.addEventListener("touchmove", function(event) {
                    Scrub(event);
                    video.pause();
                });
                moovie_el_progress.addEventListener("change", function(event) {
                    Scrub(event);
                    if (!video.pause()) { togglePlay(); }
                    togglePoster("hide");
                }, false);
                moovie_el_poster.addEventListener("touchend", function(event) { if (!video.pause()) { togglePlay(); } });

                // Volume EventListeners
                moovie_ul_soundv.addEventListener("touchmove", function(event) { ScrubSound(event); });
                moovie_ul_soundv.addEventListener("change", function(event) { ScrubSound(event); }, false);
                moovie_el_locally.style.display = "none";

                // Hide div on mouse stop
                var i = null;
                moovie_el_video.addEventListener('touchstart', e => {
                    clearTimeout(i);
                    HideControls("open");
                    i = setTimeout(function() { HideControls("close"); }, 4000);
                });
                moovie_el_video.addEventListener('touchmove', e => { clearTimeout(i); });
                moovie_el_video.addEventListener('touchend', e => {
                    clearTimeout(i);
                    i = setTimeout(function() { HideControls("close"); }, 4000);
                });
            }
        }

        /*
         ** Player Menu
         */
        var SetupMenu = this.SetupMenu = function SetupMenu() {

            // Main Menu
            for (var i = 0; i < mainmenu.length; i++) {

                if (this.config.controls[mainmenu[i].name] != undefined && this.config.controls[mainmenu[i].name] == true || mainmenu[i].opcional == false) {
                    moovie_el_controls.insertAdjacentHTML('beforeend', mainmenu[i].element);
                } else {
                    moovie_el_controls.insertAdjacentHTML('beforeend', "<div style='display:none;'>" + mainmenu[i].element + "</div>");
                }
            }

            var tooltips_menu = this.tooltips_menu = [];

            // Tooltips
            for (var i = 0; i < mainmenu.length; i++) {

                if (mainmenu[i].tooltip) {
                    // Parse from string to get id of menu
                    let doc = new DOMParser().parseFromString(mainmenu[i].element, "text/html");

                    // Insert tooltip inside button
                    document.getElementById(doc["body"]["firstChild"]["id"]).insertAdjacentHTML('beforeend', "<div id='moovie_" + mainmenu[i].name + "_tooltip_" + randomID + "' class='moovie_tooltip'>" + mainmenu[i].tooltip + "</div>");

                    // Properties of the menu
                    let targetNode = document.getElementById(doc["body"]["firstChild"]["id"]);
                    // Properties of the tooltip
                    let targetNodeTool = document.getElementById("moovie_" + mainmenu[i].name + "_tooltip_" + randomID);

                    tooltips_menu[mainmenu[i].name] = ({ 'element': targetNodeTool });
                    this.ChangeTooltip(mainmenu[i].name, 0);
                }
            }

            // Submenu base
            moovie_el_submenu = document.getElementById("moovie_submenu_" + randomID);

            // Submenu Options
            for (let key in submenu) {

                moovie_el_submenu.insertAdjacentHTML('beforeend', submenu[key]["mainElement"]);

                if (submenu[key].hasOwnProperty('elements')) {
                    for (var i = 0; i < submenu[key]["elements"].length; i++) {
                        if (this.config.controls[submenu[key]["elements"][i]['name']] != undefined && this.config.controls[submenu[key]["elements"][i]['name']] == true || submenu[key]["elements"][i]['opcional'] == false) {
                            document.getElementById(submenu[key]["parentID"] + randomID).insertAdjacentHTML('beforeend', submenu[key]["elements"][i]['element']);
                        } else {
                            document.getElementById(submenu[key]["parentID"] + randomID).insertAdjacentHTML('beforeend', "<div style='display:none;'>" + submenu[key]["elements"][i]['element']);
                        }
                    }
                }
            }

            moovie_el_progress = document.getElementById("range_progress_" + randomID);
            moovie_el_captions = document.getElementById("moovie_submenu_captions_" + randomID);
            moovie_el_range = document.getElementById("moovie_range_captions_" + randomID);
            moovie_el_speed = document.getElementById("moovie_range_speed_" + randomID);

            // Update variables
            this.moovie_el_topicCaption = document.getElementById("this.moovie_el_topicCaption_" + randomID);
            this.moovie_el_topicSpeed = document.getElementById("topic_submenu_speed_" + randomID);
            this.moovie_el_capback = document.getElementById("moovie_el_capback_" + randomID);
            this.moovie_el_capoffset = document.getElementById("moovie_el_capoffset_" + randomID);
            this.moovie_el_speedinput = moovie_el_sinput = document.getElementById("offset_range_speed_" + randomID);
            this.moovie_el_rangeinput = moovie_el_rinput = document.getElementById("offset_range_input_" + randomID);
            this.moovie_el_progressbar = moovie_el_progress;
            this.moovie_el_volume = moovie_el_volume = document.getElementById("mooviegrid_volume_" + randomID);
            this.moovie_el_cuetimer = moovie_el_cuetimer = document.getElementById("moovie_cue_timer_" + randomID);
            this.moovie_el_submenuBase = moovie_el_submenu;
            this.moovie_el_localsub = moovie_el_localsub = document.getElementById("localsub_" + randomID);
            this.moovie_el_locally = moovie_el_locally = document.getElementById("locally_" + randomID);
            this.moovie_el_submain = moovie_el_submain = document.getElementById("moovie_submenu_main_" + randomID);
            this.moovie_el_buffered = moovie_el_buffered = document.getElementById("moovie_buffered_" + randomID);

            // Control buttons
            this.control_buttons = {
                "play": this.moovie_el_play = moovie_el_play = document.getElementById("tooglebutton_" + randomID),
                "mute": this.moovie_el_mute = moovie_el_mute = document.getElementById("mooviegrid_mute_" + randomID),
                "subtitles": this.moovie_el_subtitles = moovie_el_subtitles = document.getElementById("moovie_subtitle_" + randomID),
                "config": this.moovie_el_cog = document.getElementById("moovie_el_cog_" + randomID),
                "fullscreen": this.moovie_el_fullscreen = moovie_el_fullscreen = document.getElementById("fullscreen_" + randomID)
            };
        }

        /*
         ** Player Structure
         */
        var SetupPlayer = this.SetupPlayer = function SetupPlayer() {

            // Get video source
            var vsource = this.element.getAttribute("src");
            if (vsource == null && this.element.getElementsByTagName("source")[0] != undefined) {
                vsource = this.element.getElementsByTagName("source")[0].src
            } else {
                console.log("No video source found. Read documentation to a add video source dynamically.");
            }

            // Get poster if exists
            var vposter = document.getElementById(this.selector).getAttribute("poster");

            // Hide video tag
            this.element.style.display = "none";

            // Main Div
            this.element.insertAdjacentHTML('afterend', "<div style='width:" + dimensions['width'] + "' id='moovie__video_" + randomID + "' class='moovie'></div>");
            this.moovie_el_video = moovie_el_video = document.getElementById("moovie__video_" + randomID);

            // Video tag
            moovie_el_video.insertAdjacentHTML('beforeend', "<video tabindex='1' id='moovie_vid_" + randomID + "' preload='auto' class='player__video viewer' style='width:100%; height:100%;' src='" + vsource + "' playsinline></video>");

            // Player Controls
            moovie_el_video.insertAdjacentHTML('beforeend', "<div style='opacity:0;' id='moovie__controls_" + randomID + "' class='moovie_controls'></div>");
            this.moovie_el_controlbar = moovie_el_controls = document.getElementById("moovie__controls_" + randomID);

            // Set main Play control when video is stopped
            moovie_el_video.insertAdjacentHTML('afterbegin', "<div id='medialoading_" + randomID + "' class='loadingv'><div class='loading animated fadeIn'><div class='moovie_bg'></div></div></div><div class='poster_layer posteron' id='poster_layer_" + randomID + "'></div>");
            this.medialoading = document.getElementById("medialoading_" + randomID);

            this.moovie_el_poster = moovie_el_poster = document.getElementById("poster_layer_" + randomID);
            moovie_el_poster.insertAdjacentHTML('afterbegin', "<div class='poster_center' id='poster_center_" + randomID + "' style=''></div>");
            document.getElementById("poster_center_" + randomID).insertAdjacentHTML('afterbegin', "<div class='poster_button'>\
            <svg version=\"1.1\" style='width:25px;height:25px;' fill=\"white\" xmlns=\"http://www.w3.org/2000/svg\" xmlns:xlink=\"http://www.w3.org/1999/xlink\" x=\"0px\" y=\"0px\" width=\"163.861px\" height=\"163.861px\" viewBox=\"0 0 163.861 163.861\" style=\"enable-background:new 0 0 163.861 163.861;\" xml:space=\"preserve\"><g><path d=\"M34.857,3.613C20.084-4.861,8.107,2.081,8.107,19.106v125.637c0,17.042,11.977,23.975,26.75,15.509L144.67,97.275c14.778-8.477,14.778-22.211,0-30.686L34.857,3.613z\"/></g></svg>\
            </div>");
            if (vposter != null) {
                moovie_el_poster.style.backgroundImage = "url(" + vposter + ")";
                moovie_el_poster.style.backgroundSize = "100%";
                moovie_el_poster.style.backgroundPositionY = "center";
            }

            // Add caption spot
            moovie_el_video.insertAdjacentHTML('beforeend', "<div class='moovie_captionspot caption_size'><p class='moovie_caption' id='caption_track_" + randomID + "'></p></div>");

            // Call events
            this.SetupMenu();
            this.SetupLogic();
            this.GetCaptions();
            this.Keybinds();
            SetCaptionSize();
            TransformPlayer();
        }

        // Setup
        this.SetupPlayer();

        // Function that will run repeatedly at each fixed interval of time.
        var ResizeWindow = throttle(function() {
            SetCaptionSize();
            TransformPlayer();
        }, 100);

        // Add EventListener
        window.addEventListener('resize', ResizeWindow);
    }

    /*
     ** Methods
     */

    // Trigger toggle play
    togglePlay() { this.togglePlay(); }
        // Trigger toggle subtitles
    toggleSubtitles() { this.ActivateSubtitles(); }
        // Trigger toggle Fullscreen
    toggleFullscreen() { this.SetFullScreen("toggleFullscreen"); }
        // Destroy all moovie elements and unbinds all its events
    destroy() { this.moovie_el_video.remove(); }
        // Rebuild moovie player
    build() { this.SetupPlayer(); }
        // Add new track
    addTrack(properties) {

            // OnComplete Callback
            function onComplete(callback) {
                if (typeof callback == "function") { callback(); }
            }

            if (properties.options && typeof(properties.options) === 'object') {
                // Loop object and add new options to original select box
                var prop = Object.keys(properties.options).length;
                for (var i = 0; i < prop; i++) {

                    var addlabel, srclang, tracksrc;
                    if (properties.options[i].label) { addlabel = "label='" + properties.options[i].label + "'"; } else { addlabel = "label='New Subtitle'"; }
                    if (properties.options[i].srclang) { srclang = "srclang='" + properties.options[i].srclang + "'" } else { srclang = "srclang='New'" }
                    if (properties.options[i].src) { tracksrc = "src='" + properties.options[i].src + "'" } else { tracksrc = ""; }

                    if (!tracksrc) { console.log("Error, 'src' can not be empty."); } else {
                        document.getElementById(this.selector).insertAdjacentHTML("beforeend", "<track " + addlabel + " " + srclang + " " + tracksrc + ">");
                    }
                }

                // Remove all caption itens
                document.querySelectorAll('#moovie_submenu_captions_' + this.randomID + ' .caption_track').forEach((item) => {
                    item.remove();
                });

                // fetch all track itens again
                this.GetCaptions();

                // if is "onComplete" is a function, call it back.
                if (typeof properties.onComplete == "function") { onComplete(properties.onComplete); }

            } else {
                console.error("Options must be and Object. Read documentation.");
            }
        }
        // Apply changes to current player
    change(properties) {

        // OnComplete Callback
        function onComplete(callback) {
            if (typeof callback == "function") { callback(); }
        }

        if (properties.video && typeof(properties.video) === 'object') {
            // Check if Video Source is empty or not
            if (properties.video.videoSrc) {
                // Pause video, then change source and plays it
                this.video.pause();
                this.video.src = properties.video.videoSrc;
            }

            // Check if Poster source is empty or not
            if (properties.video.posterSrc) {
                this.element.setAttribute('poster', properties.video.posterSrc);
                this.moovie_el_poster.style.backgroundImage = "url(" + properties.video.posterSrc + ")";
            }

            if (properties.captions && typeof(properties.captions) === 'object') {
                // Check if captions clear is true or false
                if (properties.captions.clearCaptions) {
                    // Remove all caption itens
                    document.querySelectorAll('#moovie_submenu_captions_' + this.randomID + ' .caption_track').forEach((item) => {
                        item.remove();
                    });
                }
            }

            // if is "onComplete" is a function, call it back.
            if (typeof properties.onComplete == "function") { onComplete(properties.onComplete); }

        } else {
            console.error("Options must be and Object. Read documentation.");
        }
    }

    /*
     ** API > Gets
     */

    // Get player element
    get playerElement() { return this.video; }
        // Get playing state
    get playing() { return Boolean(this.video.ready && !this.video.paused && !this.video.ended); }
        // Get stopped state
    get paused() { return Boolean(this.video.paused); }
        // Get stopped state
    get stopped() { return Boolean(this.video.paused && this.video.currentTime === 0); }
        // Get ended state
    get ended() { return Boolean(this.video.ended); }
        // Get duration
    get duration() {
            const Duration = parseFloat(this.video.duration);
            const realDuration = (this.video.media || {}).duration;
            const duration = realDuration || realDuration === Infinity ? 0 : realDuration;
            return Duration || duration;
        }
        // Get Seeking
    get seeking() { return Boolean(this.video.seeking); }
        // Get CurrentTime
    get currentTime() { return Number(this.video.currentTime); }
        // Get CurrentTime
    get volume() { return this.video.volume; }
        // Get muted state
    get muted() { return Boolean(this.video.muted); }
        // Get playrate
    get speed() { return Number(this.video.playbackRate); }
        // Get Mininum Speed
    get minimumSpeed() { return 0.1; }
        // Get Maximum Speed
    get maximumSpeed() { return 8; }
        // Get Mininum Offset
    get minimumOffset() { return -5; }
        // Get Maximum Offset
    get maximumOffset() { return 5; }
        // Get Source
    get source() { return this.video.currentSrc; }
        // Get Source
    get captionOffset() { return this.moovie_el_rangeinput.value; }

    /*
     ** API > Sets
     */

    // Set current time
    set currentTime(input) {
            this.video.currentTime = input;
            this.moovie_el_progressbar.value = input;
        }
        // Set volume
    set volume(input) {
            this.video.volume = input;
            this.moovie_el_volume.value = input;
            this.checkSoundLevel("checkMute");
        }
        // Set speed
    set speed(input) {
            if (input < -0.1 || input > 8) { return "Value must be between -0.1 and 8"; } else {
                this.video.playbackRate = input;
                this.moovie_el_speedinput.value = input;
                this.SpeedChange();
            }
        }
        // Set caption offset
    set captionOffset(input) {
            if (input < -5 || input > 5) { return "Value must be between -5 and 5"; } else {
                this.moovie_el_rangeinput.value = input;
                this.OffsetChange();
            }
        }
        // Change source
    set source(input) {
            this.video.pause();
            this.video.src = input;
            this.video.play();
        }
        // Set Muted
    set muted(input) { if (input) { this.checkSoundLevel("mutePlayer"); } else { this.checkSoundLevel("unmutePlayer"); } }
}

// Export module to use it in browser and NodeJS
try {
    module.exports = exports = Moovie;
} catch (e) {}