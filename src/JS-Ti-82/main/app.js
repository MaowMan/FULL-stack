function init() {
    $(":button").attr('onclick', "Button_pressed(this);");
    if (localStorage.getItem("memory") != null) {
        $(".mainview").attr("value", String(localStorage.getItem("memory")));
    }
}

function Button_pressed(button) {
    $(".mainview").attr("value", String($(".mainview").val()) + String(button.value));
    Check_view();
}

function Check_view() {
    let content = $(".mainview").val();
    let last = content.slice(-1);
    if (last === "l") {
        if (content.length == 3) {
            content = new String();
        } else {
            content = content.slice(0, -4);
        }
    } else if (last === "C") {
        content = new String();
    } else if (last === "=") {
        try {
            content = content.slice(0, -1);
            let result = 0;
            eval("result=".concat(content));
            content = String(result);
        } catch (error) {
            alert(error);
            content = new String();
        }
    }
    localStorage.setItem("memory", content);
    $(".mainview").attr("value", content);
}