/*
 * Makes each project card fully clickable: clicking anywhere on a card
 * toggles its Details panel (via the Bootstrap Collapse already loaded
 * elsewhere on the page), except clicks on a link or button the card
 * contains — doc buttons, bullet links — which are left to behave normally.
 *
 * data-card-toggle is used instead of Bootstrap's own data-bs-toggle so that
 * Bootstrap's document-level delegated listener never sees this element:
 * with data-bs-toggle on an ancestor, clicking a nested doc button would
 * bubble up and toggle the card at the same time the button opens its modal.
 */
(function () {
    "use strict";

    function panelFor(card) {
        var sel = card.getAttribute("data-card-toggle");
        return sel ? document.querySelector(sel) : null;
    }

    function toggle(card) {
        if (typeof bootstrap === "undefined") return;
        var panel = panelFor(card);
        if (!panel) return;
        bootstrap.Collapse.getOrCreateInstance(panel, { toggle: false }).toggle();
    }

    document.addEventListener("click", function (e) {
        if (!(e.target instanceof Element)) return;
        var card = e.target.closest("[data-card-toggle]");
        if (!card) return;

        var control = e.target.closest("a, button");
        if (control && card.contains(control)) return;

        toggle(card);
    });

    document.addEventListener("keydown", function (e) {
        if (e.key !== "Enter" && e.key !== " ") return;
        if (!(e.target instanceof Element) || !e.target.hasAttribute("data-card-toggle")) return;
        e.preventDefault();
        toggle(e.target);
    });

    // Keep aria-expanded on the card in sync with the panel's real state,
    // whichever way it was toggled.
    document.querySelectorAll("[data-card-toggle]").forEach(function (card) {
        var panel = panelFor(card);
        if (!panel) return;
        panel.addEventListener("show.bs.collapse", function () {
            card.setAttribute("aria-expanded", "true");
        });
        panel.addEventListener("hide.bs.collapse", function () {
            card.setAttribute("aria-expanded", "false");
        });
    });
})();
