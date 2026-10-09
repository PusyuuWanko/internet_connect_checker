# internet_connect_checker

あったら便利かな程度のインターネット接続を大体リアルタイムで表示してくれるものです。

## internet_checker_v3

`internet_checker_v3/` が最新版です(v2 までのファイルはそのまま残しています)。

- 古いブラウザ(IE など)でも動くよう、ES5 の構文だけで書き直しました。通信には fetch ではなく XMLHttpRequest を使います
- 読み込むだけで動きます。ID などの要素を用意する必要はありません

```html
<script src="./assets/scripts/internet_checker.js"></script>
```

サンプルは [internet_checker_v3/index.html](internet_checker_v3/index.html) です。
