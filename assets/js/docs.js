/*
 * Supporting-document viewer.
 *
 * Doc buttons carry data-doc-id / data-doc-url / data-doc-title. Clicking one
 * loads that document into a shared Bootstrap modal via an iframe, and pushes
 * a "#/doc/<id>" hash so the open document is deep-linkable and the browser
 * Back button closes it.
 *
 * An iframe (rather than injecting the markup) keeps each document's own CSS,
 * KaTeX styling, and any reveal.js slide-deck behaviour fully isolated from
 * the resume page.
 */
(function () {
    "use strict";

    var modalEl = document.getElementById("docModal");
    if (!modalEl || typeof bootstrap === "undefined") return;

    var frame = modalEl.querySelector("[data-doc-frame]");
    var titleEl = modalEl.querySelector("[data-doc-title]");
    var openEl = modalEl.querySelector("[data-doc-open]");
    var modal = new bootstrap.Modal(modalEl);

    var current = null; // id of the doc currently shown
    var pushed = false; // did we push a history entry for it?

    // True on phones/tablets, false on desktop regardless of window size.
    function isTouchPrimary() {
        if (window.matchMedia) return window.matchMedia("(pointer: coarse)").matches;
        return "ontouchstart" in window;
    }

    function hashId() {
        var m = location.hash.match(/^#\/doc\/(.+)$/);
        return m ? decodeURIComponent(m[1]) : null;
    }

    function triggerFor(id) {
        var all = document.querySelectorAll("[data-doc-id]");
        for (var i = 0; i < all.length; i++) {
            if (all[i].getAttribute("data-doc-id") === id) return all[i];
        }
        return null;
    }

    function open(id, push) {
        var trigger = triggerFor(id);
        if (!trigger) return;

        var url = trigger.getAttribute("data-doc-url");
        current = id;
        titleEl.textContent = trigger.getAttribute("data-doc-title") || "Document";
        openEl.href = url;
        frame.src = url;

        if (push) {
            history.pushState(null, "", "#/doc/" + encodeURIComponent(id));
            pushed = true;
        }
        modal.show();
    }

    document.addEventListener("click", function (e) {
        if (!(e.target instanceof Element)) return;
        var el = e.target.closest("[data-doc-id]");
        if (!el) return;

        // Let modifier- and middle-clicks open a new tab, as on any link.
        if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;

        // Touch devices render PDFs badly (or blank) inside an iframe, so let
        // the link open in the OS/browser viewer instead. Deliberately keyed on
        // pointer type rather than viewport width: a narrow desktop window
        // still displays an embedded PDF perfectly well.
        if (el.hasAttribute("data-doc-pdf") && isTouchPrimary()) return;

        e.preventDefault();
        open(el.getAttribute("data-doc-id"), true);
    });

    modalEl.addEventListener("hidden.bs.modal", function () {
        frame.removeAttribute("src"); // stop any media, release memory
        if (hashId() === current) {
            if (pushed) {
                history.back();
            } else {
                // Opened from a deep link, so there is no entry to pop.
                history.replaceState(null, "", location.pathname + location.search);
            }
        }
        current = null;
        pushed = false;
    });

    window.addEventListener("popstate", function () {
        var id = hashId();
        if (id) {
            if (id !== current) open(id, false);
        } else if (current) {
            modal.hide();
        }
    });

    // On touch devices, swap any doc that offers a mobile alternative (an HTML
    // rebuild falling back to its original PDF) over to that URL, and mark it as
    // a PDF so the handler above lets it open in the native viewer.
    if (isTouchPrimary()) {
        var swaps = document.querySelectorAll("[data-doc-mobile-url]");
        for (var i = 0; i < swaps.length; i++) {
            var alt = swaps[i].getAttribute("data-doc-mobile-url");
            swaps[i].setAttribute("href", alt);
            swaps[i].setAttribute("data-doc-url", alt);
            swaps[i].setAttribute("data-doc-pdf", "");
        }
    }

    // Honour a deep link on first load.
    var initial = hashId();
    if (initial) open(initial, false);
})();
