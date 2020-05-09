document.addEventListener("DOMContentLoaded", event => {
    const app = firebase.app()
    console.log(app)
    if (navigator.geolocation) {
        console.log("support geopoint")
        navigator.geolocation.getCurrentPosition(location => {
            geopoint = { latitude: location.coords.latitude, longitude: location.coords.longitude }
            console.log(geopoint)
            Object.freeze(geopoint)
        })


    }
})

let geopoint = null

Vue.directive('click-outside', {
    bind: function(el, binding, vnode) {
        this.event = function(event) {
            if (!(el === event.target || el.contains(event.target))) {
                vnode.context[binding.expression](event);
            }
        };
        document.body.addEventListener('click', this.event)
    },
    unbind: function(el) {
        document.body.removeEventListener('click', this.event)
    },
});


let loginObj = new Vue({
    el: "#loginDiv",
    data: {
        show: true
    },
    methods: {
        login: function() {
            const provider = new firebase.auth.GoogleAuthProvider();
            firebase.auth().signInWithPopup(provider)
                .then(result => {
                    this.show = false
                    const user = result.user
                    helloObj.user = user
                    helloObj.showname()
                    selectclassObj.init_class_list()
                })
        }
    }
})

let helloObj = new Vue({
    el: "#helloDiv",
    data: {
        user: null,
        show: false,
        message: "",
        portal_message: "",
        allow_click: true
    },
    methods: {
        showname: function() {
            this.message = "Hello ," + this.user.displayName
            this.portal_message = "進入管理員模式"
            this.show = true
        },
        alter_mode: function() {
            if (devObj.show === false) {
                if (this.allow_click) {
                    this.allow_click = false
                    const app = firebase.app()
                    const db = firebase.firestore()
                    const user = firebase.auth().currentUser
                    db.collection("core").doc("adminauth").get()
                        .then(doc => {
                            devObj.show_dev(true)
                            this.portal_message = "返回使用者模式"
                        })
                        .catch(err => {
                            console.log(err)
                            alert("你不具有管理員權限")
                        })
                        .finally(res => {
                            this.allow_click = true
                        })
                }

            } else {
                if (this.allow_click) {
                    this.allow_click = false
                    devObj.show_dev(false)
                    this.portal_message = "進入管理員模式"
                    this.allow_click = true
                }
            }
        }
    }

})

let selectclassObj = new Vue({
    el: "#selectclassDiv",
    data: {
        show: false,
        selected: "",
        options: []
    },
    methods: {
        init_class_list: function() {
            this.show = true
            const app = firebase.app()
            const db = firebase.firestore()
            const user = firebase.auth().currentUser
            const schedule = db.collection("user-data").doc(user.email)
            schedule.onSnapshot(doc => {
                const data = doc.data()
                this.options = data.classes.map(function(element) {
                    return { value: element, text: element }
                })
                try {
                    this.selected = this.options[0].text
                } catch (e) {
                    console.log(e)
                }
                if (selectclassObj.options.length === 0) {
                    this.show = false
                } else {
                    this.show = true
                }
                infoObj.check_if_class_open()
            })
        },
        select_changed: function() {
            infoObj.check_if_class_open()
        }
    }
})

let infoObj = new Vue({
    el: "#infoDiv",
    data: {
        show: false,
        open: false,
        message: "",
        class_attr: "is-info",
        nogeo: true
    },
    methods: {
        check_if_class_open: function() {
            if (selectclassObj.selected !== "") {
                this.show = true
                if (selectclassObj.options.length === 0) {
                    this.show = false
                }
                if (geopoint) {
                    this.nogeo = false
                } else {
                    this.nogeo = true
                }
                const class_name = selectclassObj.selected
                const app = firebase.app()
                const db = firebase.firestore()
                const user = firebase.auth().currentUser
                meta = db.collection(class_name).doc("public")
                meta.get()
                    .then(
                        doc => {
                            meta.onSnapshot(doc => {
                                const data = doc.data()
                                const is_open = data.open
                                if (is_open === true) {
                                    this.message = class_name + "現在開放點名"
                                    this.class_attr = "is-info"
                                    this.open = true

                                } else if (is_open === false) {
                                    this.message = class_name + "現在不開放點名"
                                    this.class_attr = "is-warning"
                                    this.open = false
                                }
                                formObj.init_form()
                            });
                        },
                        err => {
                            this.message = "出現未知的錯誤"
                            this.class_attr = "is-danger"
                            this.open = false
                            formObj.init_form()
                        }
                    )
                formObj.init_form()
            }
        }
    }

})

let formObj = new Vue({
    el: "#formDiv",
    data: {
        show: false,
        not_done: true,
        code: "",
        message: "",
        button_show: true,
        processing: false
    },
    methods: {
        init_form: function() {
            this.show = infoObj.open
            if (selectclassObj.options.length === 0) {
                this.show = false
            }
            this.not_done = true
            this.message = "提交"
            this.check_done()
        },
        check_done: function() {
            const app = firebase.app()
            const db = firebase.firestore()
            const user = firebase.auth().currentUser
            const class_name = selectclassObj.selected
            this.code = ""
            meta = db.collection(class_name).doc("public")
            meta.get()
                .then(
                    doc => {
                        meta.onSnapshot(doc => {
                            const data = doc.data()
                            const list = data.current
                            if (list.includes(user.email)) {
                                this.not_done = false
                                this.message = "你已完成點名"
                            }
                        })
                    },
                    err => {
                        console.log(err)
                    }
                )
        },
        submit: function() {
            if (this.not_done) {
                const app = firebase.app()
                const db = firebase.firestore()
                const user = firebase.auth().currentUser
                const class_name = selectclassObj.selected
                const code = this.code
                const collection = db.collection("log")
                collection.add({
                    class: class_name,
                    email: user.email,
                    uid: user.uid,
                    code: code,
                    geo: geopoint,
                    status: null
                }).then(
                    ref => {
                        this.process_animation(ref.id)
                    },
                    err => {

                    }
                )
            }
        },
        process_animation: function(docid) {
            console.log("process_animation")
            this.not_done = false
            this.button_show = false
            this.processing = true
            const app = firebase.app()
            const db = firebase.firestore()
            const user = firebase.auth().currentUser
            let log = db.collection("log").doc(docid)
            let listener = log.onSnapshot(doc => {
                let status = doc.data().status
                console.log(status)
                if (status === false || status === true) {
                    console.log("done process")
                    if (status === false) {
                        alert("點名失敗")
                    } else {
                        alert("點名成功")
                    }
                    this.not_done = true
                    this.button_show = true
                    this.processing = false
                    listener()
                    this.check_done()
                }
            })
        }
    }
})

let devObj = new Vue({
    el: "#devDiv",
    data: {
        show: false
    },
    methods: {
        show_dev: function(flag) {
            [devObj, selectdevclassObj].forEach(element => element.show = flag);
            [selectclassObj, infoObj, formObj].forEach(element => element.show = !flag)
            if (flag === false) {
                selectclassObj.init_class_list()
            }
        }
    }
})

let selectdevclassObj = new Vue({
    el: "#selectdevclassDiv",
    data: {
        show: false,
        show_select: false,
        selected: null,
        options: []
    },
    methods: {
        create_newclass: function() {
            cardObj.visible()
        }
    }

})

let cardObj = new Vue({
    el: "#cardDiv",
    data: {
        class_attr: "",
        ready: false,
        class_name: "",
        not_done: true
    },
    methods: {
        invisible: function() {
            if (this.ready === true) {
                this.class_attr = ""
                this.ready = false
                console.log("invisible")
            }
        },
        visible: function() {
            this.class_attr = "is-active"
            setTimeout(function() {
                cardObj.ready = true
            }, 300)
        },
        submit: function() {
            console.log("start submitting")
            const app = firebase.app()
            const db = firebase.firestore()
            const user = firebase.auth().currentUser
            db.collection("req").add({
                class_name: this.class_name,
                owner: user.uid,
                status: null
            }).then(ref => {
                    this.submit_animation(ref.id)
                },
                err => {
                    console.log(err)
                })
        },
        submit_animation: function(docid) {
            this.not_done = false
            const app = firebase.app()
            const db = firebase.firestore()
            const user = firebase.auth().currentUser
            let req = db.collection("req").doc(docid)
            let listener = req.onSnapshot(doc => {
                let status = doc.data().status
                if (status === true || status === false) {
                    if (status === true) {
                        alert("成功創建班級")
                    } else {
                        alert("創造班級失敗")
                    }
                    this.not_done = true
                    listener()
                }

            })
        }
    }
})