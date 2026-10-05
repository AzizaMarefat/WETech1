const SEMESTER_START = new Date(2026, 8, 14, 0, 0, 0);
const SEMESTER_END = new Date(2027, 1, 13, 23, 59, 59);




const menuToggle = document.querySelector(".menu-toggle");
const mainMenu = document.querySelector("#main-menu");

if (menuToggle && mainMenu) {
    menuToggle.addEventListener("click", function () {
        const isOpen = mainMenu.classList.toggle("nav-list--open");

        menuToggle.setAttribute(
            "aria-expanded",
            String(isOpen)
        );
    });
}




const lessonCells = document.querySelectorAll(".lesson-cell");
const scheduleStatus = document.querySelector("#schedule-status");

function timeToMinutes(time) {
    const [hours, minutes] = time.split(":").map(Number);

    return hours * 60 + minutes;
}


function getCurrentLesson(now) {
    if (
        now < SEMESTER_START ||
        now > SEMESTER_END
    ) {
        return null;
    }

    const currentDay = now.getDay();

    const currentMinutes =
        now.getHours() * 60 +
        now.getMinutes();

    return Array.from(lessonCells).find(function (lesson) {
        const lessonDay = Number(lesson.dataset.day);

        const lessonStart =
            timeToMinutes(lesson.dataset.start);

        const lessonEnd =
            timeToMinutes(lesson.dataset.end);

        return (
            lessonDay === currentDay &&
            currentMinutes >= lessonStart &&
            currentMinutes <= lessonEnd
        );
    });
}


function createLessonDate(now, lesson) {
    const lessonDay = Number(lesson.dataset.day);

    const [hours, minutes] =
        lesson.dataset.start
            .split(":")
            .map(Number);

    const daysAhead =
        (lessonDay - now.getDay() + 7) % 7;

    const lessonDate = new Date(now);

    lessonDate.setDate(
        now.getDate() + daysAhead
    );

    lessonDate.setHours(
        hours,
        minutes,
        0,
        0
    );

    if (lessonDate <= now) {
        lessonDate.setDate(
            lessonDate.getDate() + 7
        );
    }

    while (lessonDate < SEMESTER_START) {
        lessonDate.setDate(
            lessonDate.getDate() + 7
        );
    }

    return lessonDate;
}


function getNextLesson(now) {
    let nextLesson = null;
    let nextLessonDate = null;

    lessonCells.forEach(function (lesson) {
        const lessonDate =
            createLessonDate(now, lesson);

        if (lessonDate > SEMESTER_END) {
            return;
        }

        if (
            nextLessonDate === null ||
            lessonDate < nextLessonDate
        ) {
            nextLesson = lesson;
            nextLessonDate = lessonDate;
        }
    });

    if (!nextLesson) {
        return null;
    }

    return {
        lesson: nextLesson,
        date: nextLessonDate
    };
}


function updateCurrentLesson() {
    if (!scheduleStatus || lessonCells.length === 0) {
        return;
    }

    const now = new Date();

    lessonCells.forEach(function (lesson) {
        lesson.classList.remove("lesson--current");
    });

    const currentLesson = getCurrentLesson(now);

    if (currentLesson) {
        currentLesson.classList.add("lesson--current");

        scheduleStatus.textContent =
            "Práve prebieha: " +
            currentLesson.dataset.subject +
            " (" +
            currentLesson.dataset.start +
            "–" +
            currentLesson.dataset.end +
            ").";

        return;
    }

    const nextLesson = getNextLesson(now);

    if (!nextLesson) {
        scheduleStatus.textContent =
            "Momentálne neprebieha žiadna výučba. " +
            "V tomto semestri už nie je naplánovaná ďalšia hodina.";

        return;
    }

    const dayNames = [
        "v nedeľu",
        "v pondelok",
        "v utorok",
        "v stredu",
        "vo štvrtok",
        "v piatok",
        "v sobotu"
    ];

    scheduleStatus.textContent =
        "Momentálne neprebieha žiadna výučba. " +
        "Najbližšia hodina: " +
        nextLesson.lesson.dataset.subject +
        " " +
        dayNames[nextLesson.date.getDay()] +
        " o " +
        nextLesson.lesson.dataset.start +
        ".";
}




const filterButtons =
    document.querySelectorAll(".filter-button");

const filterEmptyMessage =
    document.querySelector("#filter-empty-message");

function filterSchedule(filter) {
    let visibleLessons = 0;

    lessonCells.forEach(function (lesson) {
        const isVisible =
            filter === "all" ||
            lesson.dataset.type === filter;

        lesson.classList.toggle(
            "lesson-cell--filtered",
            !isVisible
        );

        if (isVisible) {
            visibleLessons += 1;
        }
    });

    if (filterEmptyMessage) {
        filterEmptyMessage.hidden =
            visibleLessons !== 0;
    }
}


filterButtons.forEach(function (button) {
    button.addEventListener("click", function () {
        filterButtons.forEach(function (item) {
            item.classList.remove(
                "filter-button--active"
            );
        });

        button.classList.add(
            "filter-button--active"
        );

        filterSchedule(button.dataset.filter);
    });
});




const semesterProgress =
    document.querySelector("#semester-progress");

const semesterProgressText =
    document.querySelector("#semester-progress-text");

function updateSemesterProgress() {
    if (
        !semesterProgress ||
        !semesterProgressText
    ) {
        return;
    }

    const now = new Date();

    const semesterLength =
        SEMESTER_END - SEMESTER_START;

    const elapsed =
        now - SEMESTER_START;

    let percentage =
        (elapsed / semesterLength) * 100;

    percentage = Math.max(
        0,
        Math.min(100, percentage)
    );

    percentage = Math.round(percentage);

    semesterProgress.value = percentage;

    semesterProgressText.textContent =
        percentage +
        " % semestra uplynulo";
}


updateCurrentLesson();
updateSemesterProgress();




const mapElement = document.querySelector("#map");

if (mapElement && typeof L !== "undefined") {

    const SCHOOL = {
        name: "FEI STU",
        latitude: 48.1519,
        longitude: 17.0730
    };

    const HOME = {
        name: "Približné bydlisko",
        latitude: 48.1580,
        longitude: 17.1060
    };

    const STORAGE_KEY = "mapPoints";

    const map = L.map("map").setView(
        [48.1545, 17.0890],
        13
    );

   L.tileLayer(
    "https://tile.openstreetmap.org/{z}/{x}/{y}.png",
    {
        maxZoom: 19,
        attribution:
            '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }
).addTo(map);


    

    L.marker([
        SCHOOL.latitude,
        SCHOOL.longitude
    ])
        .addTo(map)
        .bindPopup(
            "<strong>" +
            SCHOOL.name +
            "</strong><br>Moja škola"
        );

    L.marker([
        HOME.latitude,
        HOME.longitude
    ])
        .addTo(map)
        .bindPopup(
            "<strong>" +
            HOME.name +
            "</strong><br>Približná poloha"
        );


  

    let userPoints = loadPoints();

    let userMarkers = [];

    let connectionLine = null;


    const pointSelect =
        document.querySelector("#point-select");

    const targetSelect =
        document.querySelector("#target-select");

    const calculateButton =
        document.querySelector("#calculate-distance");

    const pointList =
        document.querySelector("#point-list");

    const emptyState =
        document.querySelector("#map-empty-state");

    const distanceResult =
        document.querySelector("#distance-result");


    function loadPoints() {
        const storedPoints =
            localStorage.getItem(STORAGE_KEY);

        if (!storedPoints) {
            return [];
        }

        try {
            return JSON.parse(storedPoints);
        } catch {
            return [];
        }
    }


    function savePoints() {
        localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify(userPoints)
        );
    }


    function toRadians(degrees) {
        return degrees * Math.PI / 180;
    }


    function calculateHaversineDistance(
        latitude1,
        longitude1,
        latitude2,
        longitude2
    ) {
        const EARTH_RADIUS_KM = 6371;

        const latitudeDifference =
            toRadians(latitude2 - latitude1);

        const longitudeDifference =
            toRadians(longitude2 - longitude1);

        const firstLatitude =
            toRadians(latitude1);

        const secondLatitude =
            toRadians(latitude2);

        const a =
            Math.sin(latitudeDifference / 2) ** 2 +
            Math.cos(firstLatitude) *
            Math.cos(secondLatitude) *
            Math.sin(longitudeDifference / 2) ** 2;

        const c =
            2 * Math.atan2(
                Math.sqrt(a),
                Math.sqrt(1 - a)
            );

        return EARTH_RADIUS_KM * c;
    }


    function updatePointControls() {
        pointSelect.innerHTML =
            '<option value="">Vyberte bod</option>';

        pointList.innerHTML = "";

        userPoints.forEach(function (point, index) {

            const option =
                document.createElement("option");

            option.value = String(index);
            option.textContent = point.name;

            pointSelect.appendChild(option);


            const listItem =
                document.createElement("li");

            listItem.textContent = point.name;


            const deleteButton =
                document.createElement("button");

            deleteButton.type = "button";
            deleteButton.textContent = "Odstrániť";

            deleteButton.addEventListener(
                "click",
                function () {
                    deletePoint(index);
                }
            );

            listItem.appendChild(deleteButton);

            pointList.appendChild(listItem);
        });


        const hasPoints = userPoints.length > 0;

        pointSelect.disabled = !hasPoints;
        calculateButton.disabled = !hasPoints;

        emptyState.hidden = hasPoints;
    }


    function renderUserMarkers() {
        userMarkers.forEach(function (marker) {
            marker.remove();
        });

        userMarkers = [];

        userPoints.forEach(function (point) {

            const marker = L.marker([
                point.latitude,
                point.longitude
            ])
                .addTo(map)
                .bindPopup(
                    "<strong>" +
                    point.name +
                    "</strong>"
                );

            userMarkers.push(marker);
        });
    }


    function refreshPoints() {
        renderUserMarkers();
        updatePointControls();
    }


    function deletePoint(index) {
        userPoints.splice(index, 1);

        savePoints();
        refreshPoints();

        if (connectionLine) {
            connectionLine.remove();
            connectionLine = null;
        }

        distanceResult.textContent = "";
    }


    map.on("click", function (event) {

        const pointName = window.prompt(
            "Zadajte názov nového miesta:"
        );

        if (
            pointName === null ||
            pointName.trim() === ""
        ) {
            return;
        }

        const newPoint = {
            name: pointName.trim(),
            latitude: event.latlng.lat,
            longitude: event.latlng.lng
        };

        userPoints.push(newPoint);

        savePoints();
        refreshPoints();
    });


    calculateButton.addEventListener(
        "click",
        function () {

            const selectedIndex =
                Number(pointSelect.value);

            if (
                pointSelect.value === "" ||
                !userPoints[selectedIndex]
            ) {
                distanceResult.textContent =
                    "Najprv vyberte pridaný bod.";

                return;
            }

            const selectedPoint =
                userPoints[selectedIndex];

            const target =
                targetSelect.value === "school"
                    ? SCHOOL
                    : HOME;

            const distance =
                calculateHaversineDistance(
                    selectedPoint.latitude,
                    selectedPoint.longitude,
                    target.latitude,
                    target.longitude
                );

            distanceResult.textContent =
                "Vzdialenosť medzi miestom „" +
                selectedPoint.name +
                "“ a cieľom „" +
                target.name +
                "“ je približne " +
                distance.toFixed(2) +
                " km.";


            if (connectionLine) {
                connectionLine.remove();
            }

            connectionLine = L.polyline(
                [
                    [
                        selectedPoint.latitude,
                        selectedPoint.longitude
                    ],
                    [
                        target.latitude,
                        target.longitude
                    ]
                ]
            ).addTo(map);


            map.fitBounds(
                connectionLine.getBounds(),
                {
                    padding: [40, 40]
                }
            );


            L.popup()
                .setLatLng([
                    selectedPoint.latitude,
                    selectedPoint.longitude
                ])
                .setContent(
                    "<strong>" +
                    selectedPoint.name +
                    "</strong><br>Vzdialenosť: " +
                    distance.toFixed(2) +
                    " km"
                )
                .openOn(map);
        }
    );


    refreshPoints();
}

console.log("Generated by AI - ChatGPT");