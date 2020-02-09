(() => {
    const Utility = {
        getData: (key, updateCallback) => new Promise(async (resolve) => {
            const cacheKey = key
            const cacheData = localStorage.getItem(cacheKey)
            const nowYYYYMMDD = moment().format('YYYY-MM-DD')
            let data = {
                lastUpdated: nowYYYYMMDD,
                content: {}
            }
            if (cacheData) {
                data = JSON.parse(cacheData)
            }

            const isFirstTime = Object.keys(data.content).length == 0
            const isNotToday = data.lastUpdated != nowYYYYMMDD
            // if (isFirstTime || isNotToday) {
                try {
                    await updateCallback((result) => {
                        data.lastUpdated = nowYYYYMMDD
                        data.content = result
                        localStorage.setItem(cacheKey, JSON.stringify(data))
                        
                        resolve(data)
                    })
                } catch (err) {
                    resolve(false)
                }
            // } else {
            //     resolve(data)
            // }
        }),
        randomFromArray(arr, exclusion) {
            let items = arr
            if (exclusion) {
                items = arr.filter((d) => d != exclusion)
            }
    
            return items[Math.floor(Math.random()*items.length)]
        },
        seconds: (n) => n * 1000,
        requestTimeoutDuration: () => 5000,
        log: (...args) => (App.debug) ? console.log(...args) : $.noop(),
        sleep: (n) => new Promise((resolve) => {
            setTimeout(() => {
                resolve()
            }, Utility.seconds(n))
        }),
        toTitleCase: (str) => str.replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()),
    }
    
    const App = {
        version: (() => `v${chrome.runtime.getManifest().version}`)(),
        debug: (() => !('update_url' in chrome.runtime.getManifest()))(),
        appName: "Qurani Board",
        appLink: "https://mustofin.com",
        creatorName: "Misbakhul Mustofin",
        creatorEmail: "mr.tofin@gmail.com",
        changelogs: [
            'Initial Version: Al Alaq: 1-5',
        ],
    
        // =========== CONTENT
        
        selectedContent: false,
        updateContentDelayDuration: Utility.seconds(60),
        async getDataContentThenRender() {
            const key = `data-quran-${this.version}`
            const data = await Utility.getData(key, async (resolve) => {
                const url = `data/data-quran.json`
                const response = await fetch(url)
                const result = await response.json()
                resolve(result)
            })
            
            this.updateContent.call(this, data)
        },
        updateContent(data) {
            this.selectedContent = Utility.randomFromArray(data.content.content, this.selectedContent)
            const content = this.selectedContent
    
            $("#quran").attr("data-type", content.type)
            $("#quran").find("p.category").html(`<div>kategori: ${content.category}</div>`)
            $("#quran").find("p.matan").html(`<div>${content.matan}</div>`)
            $("#quran").find("p.translation").html(`<div>${content.translation}</div>`)
    
            if (content.type.indexOf('verse') > -1) {
                $("#quran").find("p.reference").html(`<div>${content.reference}</div>`)
            } else if (content.reference) {
                const text = content.reference.indexOf('http') > -1
                    ? `<a href='${content.reference}' target='_blank'>${content.reference}</a>`
                    : `<span>${content.reference}</span>`

                $("#quran").find("p.reference").html(`<div>${text}</div>`)
            }
    
            setTimeout(() => {
                this.updateContent.call(this, data)
            }, this.updateContentDelayDuration)
        },
    
        // =========== LOAD DATA
    
        async loadData() {
            this.getDataContentThenRender.call(this)

        },
        
        // =========== INIT
        
        init() {
            this.loadData.call(this)
        }
    }
    
    window.onload = function () {
        App.init()
    }
})()