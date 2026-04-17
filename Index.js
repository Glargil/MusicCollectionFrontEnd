// const baseURL = "https://musiccollectionrest.azurewebsites.net/api/Record"
// const authUrl = "https://musiccollectionrest.azurewebsites.net/api/Auth/login"
const baseURL = "http://localhost:5170/api/Record"
const authUrl = "http://localhost:5170/api/Auth/login"
Vue.createApp({
    data() {
        return {
            records: [],
            id: null,
            title: "",
            artist: "",
            publicationYear: null,
            duration: null,
            loggedIn: false,
            auth: {
                username: "",
                password: ""
            },
            authmessage: null,
            jwtToken: null,
            role: null,
            newRecord: { title: "", artist: "", publicationYear: null, duration: null }
        }
    },
    methods: {
        login() {
            axios.post(authUrl, this.auth)
                .then(response => {
                    this.jwtToken = response.data.token;
                    this.role = response.data.role;
                    this.loggedIn = true;
                    this.authMessage = "Authentication successful";
                    this.getAll();
                }).catch(ex => {
                    this.authMessage = "Authentication failed - " + ex.message;
                });
        },
        logout() {
            this.jwtToken = null;
            this.role = null;
            this.loggedIn = false;
            this.auth = { username: "", password: "" };
            this.records = [];
            this.authMessage = "Logged out successfully";
        },
        getAll() {
            axios.get(baseURL, {
                headers: {
                    Authorization: `Bearer ${this.jwtToken}`
                }
            })

                .then(response => {
                    this.records = response.data
                })
                .catch(error => {
                    console.error(error)
                })
        },
        SearchRecord(title, artist) {
            axios.get(`${baseURL}?title=${title}&artist=${artist}`, {
                headers: {
                    Authorization: `Bearer ${this.jwtToken}`
                }
            })
                .then(response => {
                    this.records = response.data
                })
                .catch(error => {
                    console.error(error)
                })
        },
        addRecord() {
            axios.post(baseURL, this.newRecord, {
                headers: {
                    Authorization: `Bearer ${this.jwtToken}`
                }
            })
                .then(response => {
                    this.records.push(response.data);
                    this.newRecord = { title: "", artist: "", publicationYear: null, duration: null };
                })
                .catch(error => {
                    console.error(error);
                });
        }

    }    }).mount("#app")