document.addEventListener("DOMContentLoaded", event => {
    const app = firebase.app()
    console.log(app)
})

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
                    const user = result.user
                    helloObj.user = user
                    helloObj.showname()
                    selectclassObj.init_class_list()
                    this.show = false
                })
        }
    }
})

let helloObj = new Vue({
    el: "#helloDiv",
    data: {
        user: null,
        show: false,
        message: ""
    },
    methods: {
        showname: function() {
            this.message = "Hello ," + this.user.displayName
            this.show = true
        }
    }

})

let selectclassObj = new Vue({
    el: "#selectclassDiv",
    data: {
        show: false,
        selected: "coding101",
        options: [
            { text: "coding101", value: "coding101" },
            { text: "econ203", value: "econ203" }
        ]
    },
    methods: {
        init_class_list: function() {
            this.show = true
        }
    }
})