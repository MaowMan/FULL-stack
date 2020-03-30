# From zero to 1

所有的原始碼可以在src/ClickMe/main目錄找到

剛剛體驗到了Jekyll引擎有多難用，折騰了有夠久。有注意到原始碼的話可以發現，markdown傳換成html檔我猜是從index找連結，用遞迴的方式找尋所有有辦法從index.md連接的md檔，所以相對連結要使用該檔案和目標檔案的相對位置，而非整個目錄的根相對位置。有夠莫名其妙的。

## 基本功

就如同所有C++新教學的

``` cpp

#include <iostream>
int main(){
    std::cout<<"Hello World">>
}
```

Html也有一串看起來很神奇的東西要打

``` html

<!DOCTYPE html>
<html>
    <head></head>
    <body></body>
</html>

```

今天先這樣好了，科科。
