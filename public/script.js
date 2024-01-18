const socket = io();
let currentUser = {};
let currentConversations = [];
let currentConversation = {};
let currentConnections = [];
currentSocketId = '';
let users = [];

window.addEventListener('DOMContentLoaded', () => {
    if (Cookies.get('username') !== undefined) {
        currentUser.id = Cookies.get('id');
        currentUser.username = Cookies.get('username');
        appActive();
    } else {
        showLogin();
    }

    socket.on('addMessage', (message) => {
        addMessage(message, true);
    });

    socket.on('newConnected', (response) => {
        currentConnections.push(response.user);
        newConnected(response.user);
    });

    socket.on('disconnected', (response) => {
        currentConnections = currentConnections.filter(u => u.id != response.user.id);
        newDisconnected(response.user);
    });

    socket.on('addConversation', (conversation) => {
        currentConversations.push(conversation);
        addConversation(conversation);
    });

    // Sign

    $("#signUp").click(function() {
        $(".container").addClass("right-panel-active");
    });
    
    $("#signIn").click(function() {
        $(".container").removeClass("right-panel-active");
    });

    $(".alert").on("click", function() {
		$(this).hide("slow");
	});
    $('#form1').submit((e) => {
        e.preventDefault();
    });
    $('#form2').submit((e) => {
        e.preventDefault();
    });

    const alertError = $('.status-error');
    const alertSuccess = $('.status-success');

    $('#connexionButton').click(() => {
        const email = $('#email').val();
        const password = $('#password').val();
        if (email !== '' && password !== '') {
            $.ajax({
                url: '/login',
                type: 'POST',
                contentType: 'application/json',
                data: JSON.stringify({ email: email, password: password }),
                success: function (response) {
                    if (response.message === undefined) {
                        $('.content-sign').addClass('hidden');
                        currentUser = response;
                        Cookies.set('id', currentUser.id);
                        Cookies.set('username', currentUser.username);
                        launchReboot();
                    } else {
                        alertError.html('Email ou mot de passe incorrect');
                        alertError.show(500);
                    }
                },
                error: function (error) {
                    console.error('Erreur AJAX:', error);
                }
            });
        } else {
            alertError.html('Veuillez remplir tous les champs');
            alertError.show(500);
        }
    });

    $('#inscriptionButton').click(() => {
        const username = $('#newUsername').val();
        const email = $('#newEmail').val();
        const password = $('#newPassword').val();
        if (username !== '' && email !== '' && password !== '') {
            $.ajax({
                url: '/register',
                type: 'POST',
                contentType: 'application/json',
                data: JSON.stringify({ username: username, email: email, password: password }),
                success: function (response) {
                    if (response.message === undefined) {
                        currentUser = response;
                        Cookies.set('id', currentUser.id);
                        Cookies.set('username', currentUser.username);
                        $('.content-sign').addClass('hidden');
                        launchReboot();
                    } else {
                        alertError.html('Un problème est survenu lors de l\'inscription');
                        alertError.show(500);
                    }
                },
                error: function (error) {
                    console.error('Erreur AJAX:', error);
                }
            });
        } else {
            alertError.html('Veuillez remplir tous les champs');
            alertError.show(500);
        }
    });

    const channelBody = $("div.channel-feed__body");
	const channelAuthorName = $("div.segment-topbar span.channel-link__element");

    $("#deconnexionButton").click(function () {
        Cookies.remove('username');
        showLogin();
    });

    $("#add-author-message").click(function() {
        clearConversation();
		channelAuthorName.html("Créer une conversation");
        $.ajax({
            url: '/userlist',
            type: 'GET',
            contentType: 'application/json',
            success: function (response) {
                users = response;
                let button = `
                    <button id="create-conversation" class="button button--primary button--full-width button--large">Créer un groupe</button>
                `;
                channelBody.html(button);
                $("#create-conversation").click(function() {
                    let usersConversation = [];
                    for(const elt of $(".author")) {
                        if ($(elt).hasClass("selected")) {
                            usersConversation.push(users.find(user => user.id === $(elt).data('id')));
                        }
                    }
                    if (usersConversation.length !== 0) {
                        $.ajax({
                            url: '/conversation',
                            type: 'POST',
                            contentType: 'application/json',
                            data: JSON.stringify({ currentUser: currentUser, users: usersConversation }),
                            success: function (response) {
                                channelBody.html("");
                                if (!currentConversations.find(conversation => conversation.id == response.id)) {
                                    currentConversations.push(response);
                                    addConversation(response);
                                    updateConversation(response);
                                } else {
                                    channelAuthorName.html("Aucune conversation activé");
                                }
                            },
                            error: function (error) {
                                console.error('Erreur AJAX:', error);
                            }
                        });
                    } else {
                        console.log('Aucun utilisateur sélectionné');
                    }
                });
                response.forEach(user => {
                    let userDiv = `
                    <div class="author" data-id="${user.id}">
                        <div class="author-body">
                            <div>
                                <span class="conversation-link__icon conversation-link--online"></span>
                                <span>${user.username}</span>
                            </div>
                            <a class="author-list-button-message">
                                <svg class="svg-icon" viewBox="0 0 20 20">
                                    <path d="M14.999,8.543c0,0.229-0.188,0.417-0.416,0.417H5.417C5.187,8.959,5,8.772,5,8.543s0.188-0.417,0.417-0.417h9.167C14.812,8.126,14.999,8.314,14.999,8.543 M12.037,10.213H5.417C5.187,10.213,5,10.4,5,10.63c0,0.229,0.188,0.416,0.417,0.416h6.621c0.229,0,0.416-0.188,0.416-0.416C12.453,10.4,12.266,10.213,12.037,10.213 M14.583,6.046H5.417C5.187,6.046,5,6.233,5,6.463c0,0.229,0.188,0.417,0.417,0.417h9.167c0.229,0,0.416-0.188,0.416-0.417C14.999,6.233,14.812,6.046,14.583,6.046 M17.916,3.542v10c0,0.229-0.188,0.417-0.417,0.417H9.373l-2.829,2.796c-0.117,0.116-0.71,0.297-0.71-0.296v-2.5H2.5c-0.229,0-0.417-0.188-0.417-0.417v-10c0-0.229,0.188-0.417,0.417-0.417h15C17.729,3.126,17.916,3.313,17.916,3.542 M17.083,3.959H2.917v9.167H6.25c0.229,0,0.417,0.187,0.417,0.416v1.919l2.242-2.215c0.079-0.077,0.184-0.12,0.294-0.12h7.881V3.959z"></path>
                                </svg>
                            </a>
                        </div>
                    </div>`;
                    channelBody.append(userDiv);
                    $("div.channel-feed__body .author:last-of-type").click(function() {
                        if ($(this).hasClass("selected")) {
                            $(this).removeClass("selected");
                        } else {
                            $(this).addClass("selected");
                        }
                    });
                    $("div.channel-feed__body .author:last-of-type .author-list-button-message").click(function() {
                        let userConversation = [];
                        userConversation.push(users.find(user => user.id === $(this).parent().parent().data('id')));
                        $.ajax({
                            url: '/conversation',
                            type: 'POST',
                            contentType: 'application/json',
                            data: JSON.stringify({ currentUser: currentUser, users: userConversation }),
                            success: function (response) {
                                channelBody.html("");
                                if (!currentConversations.find(conversation => conversation.id == response.id)) {
                                    currentConversations.push(response);
                                    addConversation(response);
                                }
                                channelAuthorName.html("Aucune conversation activé");
                            },
                            error: function (error) {
                                console.error('Erreur AJAX:', error);
                            }
                        });
                    });
                });
            },
            error: function (error) {
                console.error('Erreur AJAX:', error);
            }
        });
	});


    const sendButton = $("#sendButton");
    sendButton.click(function(e) {
        e.preventDefault();
        sendMessage();
	});

    window.addEventListener("keydown", function(e) {
        if((e.key === "Enter" || e.keyCode === 13) && $("#message").is(":focus")) {
            e.preventDefault();
            sendMessage();
        }
    });

});

function showLogin() {
    $('.status-success').hide(1);
	$('.status-error').hide(1);

    $('.terminal').addClass('hidden');
    $('.app-skeleton').addClass('hidden');
    $('.content-sign').removeClass('hidden');
}

const removeNoise = ({ offsetParent: {offsetParent}, lastElementChild }, type) => {
	let inputNoise;
	if (type == "input") {
        inputNoise = offsetParent.lastElementChild;
        offsetParent.classList.remove("is-focused");
	} else {
        inputNoise = lastElementChild;
	}
	inputNoise.removeChild(inputNoise.childNodes[0]);
};

const createSvg = (config) => {
	let svgGroup = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "svg"
	);
	svgGroup.setAttribute("x", config.svgGroupX);
	svgGroup.setAttribute("y", config.svgGroupY);

	let rect = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "rect"
	);
	rect.setAttribute("x", config.rectX);
	rect.setAttribute("y", config.rectY);
	rect.setAttribute("width", config.noiseWidth);
	rect.setAttribute("height", config.noiseHeight);
	rect.setAttribute("class", "noise__el");
	svgGroup.appendChild(rect);

	let rectOnBorder = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "rect"
	);
	rectOnBorder.setAttribute("x", config.rectBorderX);
	rectOnBorder.setAttribute("y", config.rectBorderY);
	rectOnBorder.setAttribute("width", config.noiseWidth);
	rectOnBorder.setAttribute("height", config.noiseHeight);
	rectOnBorder.setAttribute("fill", "rgb(15, 16, 32)");
	svgGroup.appendChild(rectOnBorder);

	let animate = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "animate"
	);
	animate.setAttribute("attributeType", "CSS");
	animate.setAttribute("attributeName", "opacity");
	animate.setAttribute("id", config.id);
	animate.setAttribute("from", "0");
	animate.setAttribute("to", "1");
	animate.setAttribute("dur", `${Math.random() + 0.1}s`);
	animate.setAttribute("repeatCount", "indefinite");
	animate.setAttribute(
        "begin",
        `${Math.random() + 0.1}s;${config.id}.end+${Math.random() + 0.1}s`
	);
	svgGroup.appendChild(animate);
	return svgGroup;
};

const generateNoise = (e, type) => {
	const svg = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "svg"
	);
	let input, inputNoise, noiseColor;
	if (type == "input") {
        input = e.offsetParent;
        e.parentElement.parentElement.classList.add("is-focused");
        inputNoise = e.parentElement.parentElement.lastElementChild;
        noiseColor = "rgb(112, 113, 156)";
	} else {
        input = e;
        inputNoise = e.lastElementChild;
        noiseColor = "rgb(73, 77, 195)";
	}
	let inputHeight = input.offsetHeight;
	let inputWidth = input.offsetWidth;
	svg.setAttribute("width", "300");
	svg.setAttribute("height", "66");
	let maxNumberOfHorizontalNoise = Math.round(inputWidth / inputHeight);
	let maxNumberOfVerticalNoise = Math.round(inputHeight / 10 / 2);
	let verticalNoiseToGenerateBottom = Math.floor(
	  Math.random() * (maxNumberOfHorizontalNoise - 1) + 1
	);
	let commonVerticalConfig = {
        inputWidth,
        noiseHeight: 2,
        rectX: "4",
        rectBorderX: "4",
        rectBorderY: "14",
        noiseColor,
	};
	let commonHorizontalConfig = {
        inputWidth,
        maxNoiseWidth: 8,
        minNoiseWidth: 2,
        noiseWidth: 2,
        rectBorderY: 14,
        noiseColor,
	};
	for (let i = 0; i <= verticalNoiseToGenerateBottom; i++) {
        svg.appendChild(
            createSvg({
                ...commonVerticalConfig,
                noiseWidth: Math.floor(Math.random() * (16 - 4) + 4),
                svgGroupX: Math.floor(Math.random() * (inputWidth - 1) + 1),
                rectY: Math.floor(Math.random() * (16 - 8) + 8),
                svgGroupY: 46,
                id: `bottom${i}`,
            })
        );
	}
	let verticalNoiseToGenerateTop = Math.floor(
	  Math.random() * (maxNumberOfHorizontalNoise - 1) + 1
	);
	for (let i = 0; i <= verticalNoiseToGenerateTop; i++) {
        svg.appendChild(
            createSvg({
                ...commonVerticalConfig,
                noiseWidth: Math.floor(Math.random() * (16 - 4) + 4),
                svgGroupX: Math.floor(Math.random() * (inputWidth - 1) + 1),
                rectY: Math.floor(Math.random() * (20 - 8) + 8),
                svgGroupY: 0,
                id: `top${i}`,
            })
        );
	}
	for (let i = 0; i <= maxNumberOfVerticalNoise; i++) {
        svg.appendChild(
            createSvg({
                ...commonHorizontalConfig,
                noiseHeight: Math.floor(Math.random() * (8 - 2) + 2),
                rectX: "2",
                rectY: Math.floor(Math.random() * (20 - 12) + 12),
                svgGroupX: 0,
                svgGroupY: Math.floor(Math.random() * (20 - 1) + 1),
                id: `left${i}`,
                rectBorderX: 0,
            })
        );
	}
	for (let i = 0; i <= maxNumberOfVerticalNoise; i++) {
        svg.appendChild(
            createSvg({
                ...commonHorizontalConfig,
                noiseHeight: Math.floor(Math.random() * (8 - 2) + 2),
                rectX: "0",
                rectY: Math.floor(Math.random() * (20 - 12) + 12),
                svgGroupX: inputWidth - 4,
                svgGroupY: Math.floor(Math.random() * (20 - 5) + 5),
                id: `right${i}`,
                rectBorderX: 2,
            })
        );
	}
	inputNoise.appendChild(svg);
};

function launchReboot(save) {
    document.querySelector(".terminal").classList.remove("hidden");
    const terminal = document.querySelector(".terminal");
    const hydra = document.querySelector(".hydra");
    const rebootSuccessText = document.querySelector(".hydra_reboot_success");
    const maxCharacters = 24;
    const unloadedCharacter = ".";
    const loadedCharacter = "#";
    const spinnerFrames = ["/", "-", "\\", "|"];

    // Clone the element and give the glitch classes
    (glitchElement => {
        const glitch = glitchElement.cloneNode(true);
        const glitchReverse = glitchElement.cloneNode(true);
        glitch.classList.add("glitch--clone", "glitch--bottom");
        glitchReverse.classList.add("glitch--clone", "glitch--top");
        glitch.setAttribute("aria-hidden", "true");
        glitchReverse.setAttribute("aria-hidden", "true");

        glitchElement.insertAdjacentElement("afterend", glitch);
        glitchElement.insertAdjacentElement("afterend", glitchReverse);
    })(terminal);

    // Get all the loading bars
    const loadingBars = document.querySelectorAll(".loading-bar");
    const processAmounts = document.querySelectorAll(".process-amount");
    const spinners = document.querySelectorAll(".spinner");
    const rebootingText = document.querySelectorAll(".hydra_rebooting");
    const glitches = document.querySelectorAll(".glitch--clone");

    // Helper for random number
    const RandomNumber = (min, max) => Math.floor(Math.random() * max) + min;

    const Delay = (time) => {
        return new Promise((resolve) => setTimeout(resolve, time))
    };

    const HideAll = elements =>
        elements.forEach(glitchGroup =>
            glitchGroup.forEach(element => element.classList.add("hidden"))	);

    const ShowAll = elements =>
        elements.forEach(glitchGroup =>
            glitchGroup.forEach(element => element.classList.remove("hidden")) );

    // Render the bar to HTML
    const RenderBar = ( values ) => {
        const currentLoaded = values.lastIndexOf(loadedCharacter) + 1;
        const loaded = values.slice(0, currentLoaded).join("");
        const unloaded = values.slice(currentLoaded).join("");

        // Update all the loading bars
        loadingBars.forEach(loadingBar => {
            loadingBar.innerHTML = `(${loaded}<span class="loading-bar--unloaded">${unloaded}</span>)`;
        });

        // Update all the percentages
        loadingPercent = Math.floor(currentLoaded / maxCharacters * 100);
        processAmounts.forEach(processAmount => {
            processAmount.innerText = loadingPercent;
        });
    };

    // Update the loaded value and render it to HTML
    const DrawLoadingBar = ( values ) => {
        return new Promise((resolve) => {
                const loadingBarAnimation = setInterval(() => {
                    if (!values.includes(unloadedCharacter)) {
                        clearInterval(loadingBarAnimation);
                        resolve();
                    }

                    values.pop(unloadedCharacter);
                    values.unshift(loadedCharacter);
                    RenderBar(values);
            }, RandomNumber(50, 70));
        });
    };

    const DrawSpinner = (spinnerFrame = 0) => {
        return setInterval(() => {
            spinnerFrame += 1;
            spinners.forEach(
                spinner =>
                    (spinner.innerText = `[${
                        spinnerFrames[spinnerFrame % spinnerFrames.length]
                    }]`)
            );
        }, RandomNumber(50, 300));
    };

    const AnimateBox = () => {
        const first = hydra.getBoundingClientRect();
        HideAll([spinners, glitches, rebootingText]);
        rebootSuccessText.classList.remove("hidden");
        rebootSuccessText.style.visibility = "hidden";
        const last = hydra.getBoundingClientRect();

        const hydraAnimation = hydra.animate([
            { transform: `scale(${first.width / last.width}, ${first.height / last.height})` },
            { transform: `scale(${first.width / last.width}, 1.2)` },
            { transform: `none` }
        ],{
            duration: 600,
            easing: 'cubic-bezier(0,0,0.32,1)',
        });	

        hydraAnimation.addEventListener('finish', () => {
            rebootSuccessText.removeAttribute("style");
            hydra.removeAttribute("style");
        });
    };

    const PlayHydra = async() => {
        terminal.classList.add("glitch");
        rebootSuccessText.classList.add("hidden");
        ShowAll([spinners, glitches, rebootingText]);
        const loadingBar = new Array(maxCharacters).fill(unloadedCharacter);
        const spinnerInterval = DrawSpinner();

        // Play the loading bar
        await DrawLoadingBar(loadingBar);
        
        // Loading is complete on the next frame, hide spinner and glitch
        requestAnimationFrame(()=> {
            clearInterval(spinnerInterval);
            terminal.classList.remove("glitch");
            AnimateBox();
            setTimeout(function() {
				appActive();
			}, 1500);
        });
    };

    PlayHydra();
}

function appActive() {
    $(".content-sign").addClass("hidden");
    $(".terminal").addClass("hidden");
    $(".app-skeleton").removeClass("hidden");

    $('#current-pseudo').html(Cookies.get('username'));

    $('#nav-group').html('');
    $('#nav-direct').html('');
    $('.channel-feed__body').html('');
    $("div.segment-topbar span.channel-link__element").html("Aucune conversation activé");

    socket.emit('connected', currentUser, (repsonse) => {
        currentSocketId = repsonse.socketId;
        currentConnections = repsonse.currentConnections;
        $.ajax({
            url: '/conversations/' + currentUser.id,
            type: 'GET',
            contentType: 'application/json',
            success: function (response) {
                currentConversations = response;
                for (const conversation of response) {
                    addConversation(conversation);
                }
            },
            error: function (error) {
                console.error('Erreur AJAX:', error);
            }
        });
    });

}

function sendMessage() {
    let message = $('#message').val();
    $('#message').val('');
    socket.emit('sendMessage', currentConversation, currentUser.id, message);
}

function addConversation(conversation) {
    for (const elt of $('.nav__item')) {
        if ($(elt).data('id') === conversation.id) {
            $(elt).remove();
        }
    }
    let user = null;
    if (conversation.users.length == 2) {
        user = conversation.users.find(user => user.id != currentUser.id);
        conversation.title = user.username;
        if (currentConnections.find(u => u.id == user.id)) {
            conversation.online = true;
        } else {
            conversation.online = false;
        }
    }
    newConversation = `
    <li class="nav__item" data-id="${conversation.id}" ${(user !== null ? 'data-iduser="' + user.id + '"' : '')})>
        <a href="#" class="nav__link">
            <span class="conversation-link conversation-link--unread ${(conversation.online !== undefined && conversation.online ? 'conversation-link--online' : '')}">
                ${(conversation.users.length == 2 ? '<span class="conversation-link__icon"></span>' : '')}
                <span class="conversation-link__element">${conversation.title}</span>
                ${(conversation.messages !== undefined && conversation.messages.length > 0 ? '<span class="conversation-link__element"><span class="badge">' + conversation.messages.length + '</span></span>' : '')}
            </span>
            <svg class="svg-icon-close-conversation" viewBox="0 0 20 20">
                <path fill="none" d="M15.898,4.045c-0.271-0.272-0.713-0.272-0.986,0l-4.71,4.711L5.493,4.045c-0.272-0.272-0.714-0.272-0.986,0s-0.272,0.714,0,0.986l4.709,4.711l-4.71,4.711c-0.272,0.271-0.272,0.713,0,0.986c0.136,0.136,0.314,0.203,0.492,0.203c0.179,0,0.357-0.067,0.493-0.203l4.711-4.711l4.71,4.711c0.137,0.136,0.314,0.203,0.494,0.203c0.178,0,0.355-0.067,0.492-0.203c0.273-0.273,0.273-0.715,0-0.986l-4.711-4.711l4.711-4.711C16.172,4.759,16.172,4.317,15.898,4.045z"></path>
            </svg>
        </a>
    </li>`;
    let navDiv = '#nav-direct';
    if (conversation.users.length > 2) {
        navDiv = '#nav-group';
    }
    $(navDiv).append(newConversation);
    $(navDiv + ' .nav__item:last-of-type').click(function() {
        if (currentConversation.id !== undefined && currentConversation.id == conversation.id) {
            return;
        }
        clearConversation();
        $(this).addClass("selected");
        updateConversation(conversation);
    });
}

function updateConversation(conversation) {
    currentConversation = conversation;
    const channelBody = $("div.channel-feed__body");
	const channelAuthorName = $("div.segment-topbar span.channel-link__element");
    channelAuthorName.html(conversation.title);
    channelBody.html("");
    for (const elt of $('.nav__item')) {
        if ($(elt).data('id') === conversation.id) {
            $(elt).addClass("selected");
        } else {
            $(elt).removeClass("selected");
        }
    }
    $.ajax({
        url: '/conversation/messages/' + conversation.id,
        type: 'GET',
        contentType: 'application/json',
        success: function (response) {
            currentConversation.messages = response;
            for (const message of response) {
                addMessage(message);
            }
            $(".channel-feed__body").animate({ scrollTop: $('.channel-feed__body').prop("scrollHeight") });
        },
        error: function (error) {
            console.error('Erreur AJAX:', error);
        }
    });
}

function addMessage(message, newMessage = false) {
    const channelBody = $("div.channel-feed__body");
    let messageDiv = `
    <div class="message ${(message.idUser == currentUser.id ? 'rightMessage' : '')}">
        <div class="message__body">
            <div>
                ${message.message}
            </div>
        </div>
        <div class="message__footer">
            <span class="message__authoring">${currentConversation.users.find(user => user.id == message.idUser).username}</span> - ${formatDate(message.createdAt)}
        </div>
    </div>
    `;
    channelBody.append(messageDiv);
    if (newMessage) {
        $(".channel-feed__body").animate({ scrollTop: $('.channel-feed__body').prop("scrollHeight") });
    }
}

function formatDate(dateString) {
    const messageDate = new Date(dateString);
    const currentDate = new Date();

    // Vérifier si la date est aujourd'hui
    if (isSameDay(messageDate, currentDate)) {
        return formatTime(messageDate);
    }

    // Vérifier si la date est de cette semaine
    if (isWithinLastSevenDays(messageDate, currentDate)) {
        return formatDayAndTime(messageDate);
    }

    // Si la date n'est ni aujourd'hui ni de cette semaine, afficher la date exacte
    return formatFullDate(messageDate);
}

function isSameDay(date1, date2) {
    return (
        date1.getDate() === date2.getDate() &&
        date1.getMonth() === date2.getMonth() &&
        date1.getFullYear() === date2.getFullYear()
    );
}

function isWithinLastSevenDays(date1, date2) {
    const millisecondsInDay = 24 * 60 * 60 * 1000;
    const diffInDays = Math.abs(
        (date1.getTime() - date2.getTime()) / millisecondsInDay
    );
    return diffInDays <= 7;
}

function formatTime(date) {
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
}

function formatDayAndTime(date) {
    const daysOfWeek = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
    const dayOfWeek = daysOfWeek[date.getDay()];
    const time = formatTime(date);
    return `${dayOfWeek} ${time}`;
}

function formatFullDate(date) {
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    const time = formatTime(date);
    return `${day}/${month}/${year} ${time}`;
}

function clearConversation(id) {
    currentConversation = {};
    for (const elt of $('.nav__item')) {
        $(elt).removeClass("selected");
    }
}

function newConnected(user) {
    for (const elt of $('#nav-direct .nav__item')) {
        if ($(elt).data('iduser') == user.id) {
            $(elt).find('.conversation-link').addClass('conversation-link--online');
        }
    }
}

function newDisconnected(user) {
    for (const elt of $('#nav-direct .nav__item')) {
        if ($(elt).data('iduser') == user.id) {
            $(elt).find('.conversation-link').removeClass('conversation-link--online');
        }
    }
}