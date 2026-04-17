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
            authMessage: null,
            jwtToken: null,
            role: null,
            newRecord: { title: "", artist: "", publicationYear: null, duration: null },
            updateData: { id: null, title: "", artist: "", publicationYear: null, duration: null },
            deleteMessage: null,
            updateMessage: null
        }
    },
    computed: {
        isAdmin() {
            return String(this.role || "").toLowerCase() === "admin";
        }
    },
    methods: {
        getRoleFromToken(token) {
            if (!token) return null;
            try {
                const payloadBase64 = token.split(".")[1];
                const payloadJson = atob(payloadBase64.replace(/-/g, "+").replace(/_/g, "/"));
                const payload = JSON.parse(payloadJson);

                // Support common JWT role claim names from .NET and generic issuers.
                return (
                    payload.role ||
                    payload.roles?.[0] ||
                    payload["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"] ||
                    payload["https://schemas.microsoft.com/ws/2008/06/identity/claims/role"] ||
                    null
                );
            } catch {
                return null;
            }
        },
        login() {
            axios.post(authUrl, this.auth)
                .then(response => {
                    this.jwtToken = response.data.token;
                    const roleFromResponse =
                        response.data.role ||
                        response.data.userRole ||
                        response.data.roles?.[0] ||
                        null;
                    this.role = roleFromResponse || this.getRoleFromToken(this.jwtToken);
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
        },
        async deleteRecord(Id) {
            if (Id === null || Id === undefined || isNaN(Id) || Id <= 0) {
                alert("Please enter a valid record ID")
                return
            }
            const url = baseURL + "/" + Id
            try {
                const response = await axios.delete(url, {
                    headers: {
                        Authorization: `Bearer ${this.jwtToken}`
                    }
                })
                this.deleteMessage = response.status + " " + response.statusText
                this.getAll()
            } catch (ex) {
                alert(ex.message)
            }
        },
        update() {
            if (this.updateData.id === null || this.updateData.id === undefined || isNaN(this.updateData.id) || this.updateData.id <= 0) {
                this.updateMessage = "No changes made: please enter a valid id"
                return
            }

            const RecordToUpdate = this.records.find(record => record.id === this.updateData.id)
            if (!RecordToUpdate) {
                this.updateMessage = "No record found with id " + this.updateData.id
                return
            }

            const hasNewTitle = this.updateData.title !== null && this.updateData.title !== undefined && this.updateData.title.trim() !== ""
            const hasNewArtist = this.updateData.artist !== null && this.updateData.artist !== undefined && this.updateData.artist.trim() !== ""
            const hasNewPublicationYear = this.updateData.publicationYear !== null && this.updateData.publicationYear !== undefined && !isNaN(this.updateData.publicationYear)
            const hasNewDuration = this.updateData.duration !== null && this.updateData.duration !== undefined && !isNaN(this.updateData.duration)
            if (!hasNewTitle && !hasNewArtist) {
                this.updateMessage = "No changes made: fill title and/or artist to update"
                return
            }

            if (hasNewTitle) {
                RecordToUpdate.title = this.updateData.title
            }
            if (hasNewArtist) {
                RecordToUpdate.artist = this.updateData.artist
            }
            if(hasNewPublicationYear) {
                RecordToUpdate.publicationYear = this.updateData.publicationYear
            }
            if(hasNewDuration) {
                RecordToUpdate.duration = this.updateData.duration
            }


            this.updateMessage = "Record updated locally"
        }

    }    }).mount("#app")