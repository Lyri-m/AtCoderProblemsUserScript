// ==UserScript==
// @name         AtCoder Problems Virtual Contest Creator Helper
// @namespace    https://github.com/Lyri-m/AtCoderProblemsUserScript
// @version      0.1
// @description  AtCoder ProblemsでVirtual Contest作成画面に、複数URLを指定可能な入力欄を追加します
// @author       Lyri
// @match        https://kenkoooo.com/atcoder/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    // メイン処理が実行済みかどうかを示すフラグ
    let isMainProcessExecuted = false;

    // メイン処理を関数化
    function mainProcess() {
        if (isMainProcessExecuted) return;

        // CSSセレクタで要素を取得
        const searchInput = document.querySelector("input[placeholder='Search here to add problems.']");
        if (!searchInput) return;

        // 新しいinput要素とボタンを作成
        const newInput = document.createElement("input");
        newInput.type = "text";
        newInput.placeholder = "Please enter the problem URLs. You can input multiple URLs separated by newlines, spaces, or tabs.";

        // searchInputのクラスをnewInputに適用
        newInput.className = searchInput.className;
        newInput.className = newInput.className + " my-2";

        const addButton = document.createElement("button");
        addButton.type = "button";
        addButton.textContent = "Add Problems";
        addButton.className = "btn btn-secondary";

        // 新しい要素をDOMに追加
        searchInput.insertAdjacentElement('afterend', newInput);
        newInput.insertAdjacentElement('afterend', addButton);

        // ボタンがクリックされたときの処理
        function addProblems() {
            const problemsText = newInput.value;
            // 改行（\r\nおよび\n）、半角空白、TABで分割
            const problemsArray = problemsText.split(/[\r\n]+|[\n\s\t]+/);

            // 配列から一つずつ値を取り出して処理
            problemsArray.forEach(problem => {
                if (problem.trim() === "") return; // 空文字は無視

                // input要素のvalue属性を直接設定し、inputイベントを発火
                const nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
                nativeInputValueSetter.call(searchInput, problem);

                const inputEvent = new Event('input', { bubbles: true });
                searchInput.dispatchEvent(inputEvent);

                // XPathで要素を取得してクリック
                const xpath = "//h2[text()='Contest Problemset']/following::div[@class='my-2 row'][2]//li[1]";
                const problemElement = document.evaluate(xpath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
                if (problemElement) {
                    problemElement.click();
                }
            });

            // newInput要素のテキストをクリア
            newInput.value = "";
        }

        addButton.addEventListener("click", addProblems);

        // Enterキーが押されたときの処理
        newInput.addEventListener("keydown", (event) => {
            if (event.key === "Enter") {
                event.preventDefault(); // フォームの送信などを防ぐ
                addProblems();
            }
        });

        // メイン処理が実行されたことを記録
        isMainProcessExecuted = true;
    }

    // ハッシュ部分を監視する関数
    function checkHash() {
        if (window.location.hash === "#/contest/create") {
            mainProcess();
        } else {
            // 他のページに遷移した場合にフラグをリセット
            isMainProcessExecuted = false;
        }
    }

    // 初回チェック
    checkHash();

    // ハッシュの変更を監視
    window.addEventListener('hashchange', checkHash);

    // MutationObserverを使用してDOMの変更を監視
    const observer = new MutationObserver(checkHash);
    observer.observe(document.body, { childList: true, subtree: true });
})();
