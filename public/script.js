const socket = io();
let currentUser = {};
let currentConversations = [];
let currentConversation = {};
let currentConnections = [];
let currentTarget = null;
currentSocketId = '';
let users = [];

class ContextMenu {
    constructor({ target = null, menuItems = [] }) {
        this.target = target;
        this.menuItems = menuItems;
        this.menuItemsNode = this.getMenuItemsNode();
        this.isOpened = false;
        this.contextMenu = null;
    }

    getTargetNode() {
        const nodes = document.querySelectorAll(this.target);
        if (nodes && nodes.length !== 0) {
            return nodes;
        } else {
            console.error(`getTargetNode :: "${this.target}" target not found`);
            return [];
        }
    }

    getMenuItemsNode() {
        const nodes = [];
        if (!this.menuItems) {
            console.error("getMenuItemsNode :: Please enter menu items");
            return [];
        }
        this.menuItems.forEach((data, index) => {
            const item = this.createItemMarkup(data);
            item.firstChild.setAttribute(
                "style",
                `animation-delay: ${index * 0.08}s`
            );
            nodes.push(item);
        });
        return nodes;
    }

    createItemMarkup(data) {
        const button = document.createElement("BUTTON");
        const item = document.createElement("LI");
        button.innerHTML = data.content;
        button.classList.add("contextMenu-button");
        item.classList.add("contextMenu-item");
        if (data.divider) item.setAttribute("data-divider", data.divider);
        item.appendChild(button);
        if (data.events && data.events.length !== 0) {
            Object.entries(data.events).forEach((event) => {
                const [key, value] = event;
                button.addEventListener(key, value);
            });
        }
        if (data.submenu) {
            let subMenuList = [];
            for (const menu of data.submenu) {
                const newMenu = this.createItemMarkup(menu);
                subMenuList.push(newMenu);
            }
            const subMenuContainerDiv = document.createElement("DIV");
            subMenuContainerDiv.classList.add("contextMenu-subMenu");
            const subMenuContainer = document.createElement("UL");
            subMenuList.forEach((item) => subMenuContainer.appendChild(item));
            subMenuContainerDiv.appendChild(subMenuContainer);
            item.appendChild(subMenuContainerDiv);
            item.addEventListener("mouseover", () => {
                subMenuContainerDiv.classList.add("contextMenu-subMenu--active");
            });
            item.addEventListener("mouseout", () => {
                subMenuContainerDiv.classList.remove("contextMenu-subMenu--active");
            });
        }
        return item;
    }

    renderMenu() {
        const menuContainer = document.createElement("UL");
        menuContainer.classList.add("contextMenu");
        this.menuItemsNode.forEach((item) => menuContainer.appendChild(item));
        return menuContainer;
    }

    closeMenu(menu) {
        if (this.isOpened) {
            this.isOpened = false;
            if (menu.querySelector(".contextMenu-subMenu--active") !== null) {
                menu.querySelector(".contextMenu-subMenu--active").classList.remove('contextMenu-subMenu--active');
            }
            menu.remove();
        }
    }

    addTarget(target) {
        let node = document.querySelector(target);
        node.addEventListener("contextmenu", (e) => {
            e.preventDefault();
            this.isOpened = true;

            currentTarget = target;

            const { clientX, clientY } = e;
            document.body.appendChild(this.contextMenu);
    
            const positionY =
                clientY + this.contextMenu.scrollHeight >= window.innerHeight
                ? window.innerHeight - this.contextMenu.scrollHeight - 20
                : clientY;
            const positionX =
                clientX + this.contextMenu.scrollWidth >= window.innerWidth
                ? window.innerWidth - this.contextMenu.scrollWidth - 20
                : clientX;
    
            this.contextMenu.setAttribute(
                "style",
                `--width: ${this.contextMenu.scrollWidth}px;
                --height: ${this.contextMenu.scrollHeight}px;
                --top: ${positionY}px;
                --left: ${positionX}px;`
            );
        });
    }

    init() {
        this.targetNode = this.getTargetNode();

        this.contextMenu = this.renderMenu();
        document.addEventListener("click", () => this.closeMenu(this.contextMenu));
        window.addEventListener("blur", () => this.closeMenu(this.contextMenu));

        this.targetNode.forEach((target) => {
            target.addEventListener("contextmenu", (e) => {
                e.preventDefault();
                this.isOpened = true;

                currentTarget = target;

                const { clientX, clientY } = e;
                document.body.appendChild(this.contextMenu);
        
                const positionY =
                    clientY + this.contextMenu.scrollHeight >= window.innerHeight
                    ? window.innerHeight - this.contextMenu.scrollHeight - 20
                    : clientY;
                const positionX =
                    clientX + this.contextMenu.scrollWidth >= window.innerWidth
                    ? window.innerWidth - this.contextMenu.scrollWidth - 20
                    : clientX;
        
                this.contextMenu.setAttribute(
                    "style",
                    `--width: ${this.contextMenu.scrollWidth}px;
                    --height: ${this.contextMenu.scrollHeight}px;
                    --top: ${positionY}px;
                    --left: ${positionX}px;`
                );
            });
        });
    }
}

const copyIcon = `<svg viewBox="0 0 24 24" width="13" height="13" stroke="currentColor" stroke-width="2.5" style="margin-right: 7px" fill="none" stroke-linecap="round" stroke-linejoin="round" class="css-i6dzq1"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>`;
const cutIcon = `<svg viewBox="0 0 24 24" width="13" height="13" stroke="currentColor" stroke-width="2.5" style="margin-right: 7px" fill="none" stroke-linecap="round" stroke-linejoin="round" class="css-i6dzq1"><circle cx="6" cy="6" r="3"></circle><circle cx="6" cy="18" r="3"></circle><line x1="20" y1="4" x2="8.12" y2="15.88"></line><line x1="14.47" y1="14.48" x2="20" y2="20"></line><line x1="8.12" y1="8.12" x2="12" y2="12"></line></svg>`;
const pasteIcon = `<svg viewBox="0 0 24 24" width="13" height="13" stroke="currentColor" stroke-width="2.5" style="margin-right: 7px; position: relative; top: -1px" fill="none" stroke-linecap="round" stroke-linejoin="round" class="css-i6dzq1"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path><rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect></svg>`;
const downloadIcon = `<svg viewBox="0 0 24 24" width="13" height="13" stroke="currentColor" stroke-width="2.5" style="margin-right: 7px; position: relative; top: -1px" fill="none" stroke-linecap="round" stroke-linejoin="round" class="css-i6dzq1"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>`;
const deleteIcon = `<svg viewBox="0 0 24 24" width="13" height="13" stroke="currentColor" stroke-width="2.5" fill="none" style="margin-right: 7px" stroke-linecap="round" stroke-linejoin="round" class="css-i6dzq1"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>`;
const arrowRightIcon = `<svg viewBox="0 0 24 24" width="13" height="13" stroke="currentColor" stroke-width="2.5" fill="none" style="margin-left: 10px" stroke-linecap="round" stroke-linejoin="round" class="css-i6dzq1"><path d="M7.82054 20.7313C8.21107 21.1218 8.84423 21.1218 9.23476 20.7313L15.8792 14.0868C17.0505 12.9155 17.0508 11.0167 15.88 9.84497L9.3097 3.26958C8.91918 2.87905 8.28601 2.87905 7.89549 3.26958C7.50497 3.6601 7.50497 4.29327 7.89549 4.68379L14.4675 11.2558C14.8581 11.6464 14.8581 12.2795 14.4675 12.67L7.82054 19.317C7.43002 19.7076 7.43002 20.3407 7.82054 20.7313Z"/></svg>`;
const emoteIcon = `<svg viewBox="0 0 512 512" width="13" height="13" stroke="currentColor" fill="currentColor" stroke-width="2.5" fill="none" style="margin-right: 7px" stroke-linecap="round" stroke-linejoin="round" class="css-i6dzq1"><path d="M464 256A208 208 0 1 0 48 256a208 208 0 1 0 416 0zM0 256a256 256 0 1 1 512 0A256 256 0 1 1 0 256zm349.5 52.4c18.7-4.4 35.9 12 25.5 28.1C350.4 374.6 306.3 400 255.9 400s-94.5-25.4-119.1-63.5c-10.4-16.1 6.8-32.5 25.5-28.1c28.9 6.8 60.5 10.5 93.6 10.5s64.7-3.7 93.6-10.5zM144.4 208a32 32 0 1 1 64 0 32 32 0 1 1 -64 0zm192-32a32 32 0 1 1 0 64 32 32 0 1 1 0-64z"/></svg>`
const menuItems = [
    {
        content: `${emoteIcon}Ajouter réaction${arrowRightIcon}`,
        type: "submenu",
        submenu: [
            {
                content: "😀",
                events: {
                    click: () => addReaction('😀', 1)
                }
            },
            {
                content: "😁",
                events: {
                    click: () => addReaction('😁', 2)
                }
            },
            {
                content: "😅",
                events: {
                    click: () => addReaction('😅', 3)
                }
            },
            {
                content: "😂",
                events: {
                    click: () => addReaction('😂', 4)
                }
            },
            {
                content: "👍",
                events: {
                    click: () => addReaction('👍', 5)
                }
            },
            {
                content: "👏",
                events: {
                    click: () => addReaction('👏', 6)
                }
            },
            {
                content: "👌",
                events: {
                    click: () => addReaction('👌', 7)
                }
            },
            {
                content: "✅",
                events: {
                    click: () => addReaction('✅', 8)
                }
            },
            {
                content: "❌",
                events: {
                    click: () => addReaction('❌', 9)
                }
            }
        ]
    },
    {
        content: `${deleteIcon}Supprimer`,
        divider: "top-bottom", // top, bottom, top-bottom
        events: {
            click: () => deleteMessage()
        }
    },
];

const contextMenuHome = new ContextMenu({
    target: ".message",
    menuItems
});

window.addEventListener('DOMContentLoaded', () => {
    if (Cookies.get('username') !== undefined) {
        currentUser.id = Cookies.get('id');
        currentUser.username = Cookies.get('username');
        appActive();
    } else {
        showLogin();
    }

    socket.on('addMessage', (message) => {
        if (message.idConversation == currentConversation.id) {
            addMessage(message, true);
        } else if (message.idUser != currentUser.id) {
            addNotifConversation(message);
        }
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

    socket.on('deleteMessage', (idMessage) => {
        $(`.message[data-id="${idMessage}"]`).remove();
    });

    socket.on('addReaction', (response) => {
        let message = $(`.message[data-id="${response.idMessage}"]`);
        let messageEmoji = message.find('.message__emoji');
        if (messageEmoji.find(`.message__emoji-button[data-reaction="${response.reaction}"]`).length > 0) {
            let count = messageEmoji.find(`.message__emoji-button[data-reaction="${response.reaction}"]`).find('.message__emoji-count');
            count.html(parseInt(count.html()) + 1);
            if (response.idUser == currentUser.id) {
                messageEmoji.find(`.message__emoji-button[data-reaction="${response.reaction}"]`).addClass('selected');
            }
        } else {
            let newReaction = `
            <button class="message__emoji-button ${(response.idUser == currentUser.id ? 'selected' : '')}" data-reaction="${response.reaction}" data-idreaction="${response.idReaction}">
                <span class="message__emoji-title">${response.reaction}</span>
                <span class="message__emoji-count">1</span>
            </button>
            `;
            $(`.message[data-id="${response.idMessage}"]`).find('.message__emoji').append(newReaction);
            $(`.message[data-id="${response.idMessage}"] .message__emoji .message__emoji-button[data-reaction="${response.reaction}"]`).click(function() {
                socket.emit('addReaction', currentConversation, currentUser, response.idMessage, response.reaction, response.idReaction);
            });
        }
    });

    socket.on('deleteReaction', (response) => {
        let message = $(`.message[data-id="${response.idMessage}"]`);
        let messageEmoji = message.find('.message__emoji');
        if (messageEmoji.find(`.message__emoji-button[data-reaction="${response.reaction}"]`).length > 0) {
            let count = messageEmoji.find(`.message__emoji-button[data-reaction="${response.reaction}"]`).find('.message__emoji-count');
            if (parseInt(count.html()) == 1) {
                messageEmoji.find(`.message__emoji-button[data-reaction="${response.reaction}"]`).remove();
            } else {
                count.html(parseInt(count.html()) - 1);
                if (response.idUser == currentUser.id) {
                    messageEmoji.find(`.message__emoji-button[data-reaction="${response.reaction}"]`).removeClass('selected');
                }
            }
        }
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
        $('#statistiques').addClass('hidden');
        $('#messages-search').addClass('hidden');
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
                    if (user.id == currentUser.id) {
                        return;
                    }
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
            if (e.shiftKey) {
                $("#message").val($("#message").val() + "\n");
            } else {
                sendMessage();
            }
        }
    });

    $('#conversation-search').on('input', function() {
        let value = $(this).val().toLowerCase();
        $('.nav__item').filter(function() {
            $(this).toggle($(this).find('.conversation-link__element').text().toLowerCase().indexOf(value) > -1);
        });
    });

    $('#conversation-messages-search').on('input', function() {
        let value = $(this).val().toLowerCase();
        $('.message').filter(function() {
            $(this).toggle($(this).find('.message__body div').text().toLowerCase().indexOf(value) > -1);
        });
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
    message = message.replace(/\n/g, '<br>');
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
    } else {
        conversation.title = '# ' + conversation.title;
    }
    newConversation = `
    <li class="nav__item" data-id="${conversation.id}" ${(user !== null ? 'data-iduser="' + user.id + '"' : '')})>
        <a href="#" class="nav__link">
            <span class="conversation-link ${(conversation.online !== undefined && conversation.online ? 'conversation-link--online' : '')}">
                ${(conversation.users.length == 2 ? '<span class="conversation-link__icon"></span>' : '')}
                <span class="conversation-link__element">${conversation.title}</span>
                <span class="conversation-link__element conversation-link__element__badge"></span>
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
    $('#statistiques').removeClass('hidden');
    $('#messages-search').removeClass('hidden');
    if ($('.nav__item[data-id="' + conversation.id + '"] .conversation-link__element__badge .badge').length > 0) {
        $('.nav__item[data-id="' + conversation.id + '"] .conversation-link__element__badge .badge').remove();
        $('.nav__item[data-id="' + conversation.id + '"] .conversation-link').removeClass('conversation-link--unread');
    }
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
            let stats = {
                total: 0,
                others: 0,
                me: 0
            };
            for (const message of response) {
                if (message.idUser == currentUser.id) {
                    stats.me++;
                } else {
                    stats.others++;
                }
                stats.total++;
                addMessage(message);
            }
            $('#statistiques .statistique-send-total').html(stats.total);
            $('#statistiques .statistique-send-others').html(stats.others);
            $('#statistiques .statistique-send-me').html(stats.me);
            contextMenuHome.init();
            $(".channel-feed__body").animate({ scrollTop: $('.channel-feed__body').prop("scrollHeight") }, 0);
        },
        error: function (error) {
            console.error('Erreur AJAX:', error);
        }
    });
}

function addMessage(message, newMessage = false) {
    const channelBody = $("div.channel-feed__body");
    let reactions = ``;
    let reactionsList = [];
    for (const reaction of message.reactions) {
        if (reactionsList.find(r => r.reaction == reaction.reaction)) {
            reactionsList.find(r => r.reaction == reaction.reaction).count++;
            if (reaction.idUser == currentUser.id) {
                reactionsList.find(r => r.reaction == reaction.reaction).userSelected = true;
            }
        } else {
            reactionsList.push({ reaction: reaction.reaction, count: 1, userSelected: (reaction.idUser == currentUser.id ? true : false) });
        }
    }
    for (const reaction of reactionsList) {
        reactions += `
        <button class="message__emoji-button ${(reaction.userSelected ? 'selected' : '')}" data-reaction="${reaction.reaction} data-idreaction="${reaction.idReaction}">
            <span class="message__emoji-title">${reaction.reaction}</span>
            <span class="message__emoji-count">${reaction.count}</span>
        </button>
        `;
    }

    // Remplacement des liens par des vidéos embarquées

    // if have link but text too
    if (message.message.includes('http') && !message.message.includes(' ')) {
        let youtubeRegex = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
        let spotifyRegex = /(?:https?:\/\/)?(?:open\.spotify\.com)?(?:track\/([a-zA-Z0-9]+))/;
        let soundcloudRegex = /https:\/\/soundcloud\.com\/([a-zA-Z0-9-]+)\/([a-zA-Z0-9-]+)/;
        let twitterRegex = /https:\/\/?(?:twitter\.com|x\.com)\/([a-zA-Z0-9_]+)\/status\/([0-9]+)/;
        let instagramRegex = /https:\/\/www\.instagram\.com\/p\/([a-zA-Z0-9_-]+)\//;
        message.message = message.message.replace(youtubeRegex, '<iframe width="100%" height="350" src="https://www.youtube.com/embed/$1" frameborder="0" allowfullscreen></iframe>');
        message.message = message.message.replace(spotifyRegex, '<iframe src="https://open.spotify.com/embed/track/$1" width="100%" height="80" frameborder="0" allowtransparency="true" allow="encrypted-media"></iframe>');
        message.message = message.message.replace(soundcloudRegex, '<iframe width="100%" height="166" scrolling="no" frameborder="no" allow="autoplay" src="https://w.soundcloud.com/player/?url=https%3A//soundcloud.com/$1/$2&color=%23ff5500&auto_play=false&hide_related=false&show_comments=true&show_user=true&show_reposts=false&show_teaser=true&visual=true"></iframe>');
        message.message = message.message.replace(twitterRegex, '<blockquote class="twitter-tweet"><a href="https://twitter.com/$1/status/$2"></a></blockquote><script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script>');
        message.message = message.message.replace(instagramRegex, '<blockquote class="instagram-media" data-instgrm-permalink="https://www.instagram.com/p/$1/" data-instgrm-version="13" style=" background:#FFF; border:0; border-radius:3px; box-shadow:0 0 1px 0 rgba(0,0,0,0.5),0 1px 10px 0 rgba(0,0,0,0.15); margin: 1px; max-width:540px; min-width:326px; padding:0; width:99.375%; width:-webkit-calc(100% - 2px); width:calc(100% - 2px);"></blockquote><script async src="https://www.instagram.com/embed.js"></script>');
        if (message.message.includes('iframe')) {
            message.message = message.message.substring(message.message.indexOf('<iframe'));
            message.message = message.message.substring(0, message.message.indexOf('</iframe>') + 9);
        } else if (message.message.includes('blockquote')) {
            message.message = message.message.substring(0, message.message.indexOf('</script>') + 9);
        }
    }

    let messageDiv = `
    <div class="message ${(message.idUser == currentUser.id ? 'rightMessage' : '')} ${(message.message.includes('iframe') || message.message.includes('blockquote') ? 'iframe' : '')}" data-id="${message.id}">
        <div class="message__body">
            <div>${message.message}</div>
        </div>
        <div class="message__footer">
            <span class="message__authoring">
                ${currentConversation.users.find(user => user.id == message.idUser).username}
            </span> 
            <span>-</span>
            <span>${formatDate(message.createdAt)}</span>
            <div class="message__emoji">
                ${reactions}
            </div>
        </div>
    </div>
    `;
    channelBody.append(messageDiv);
    channelBody.find('.message:last-of-type .message__emoji-button').click(function() {
        socket.emit('addReaction', currentConversation, currentUser, message.id, $(this).data('reaction'), $(this).data('idreaction'));
    });
    if (newMessage) {
        contextMenuHome.addTarget('.message:last-of-type');
        if (message.idUser == currentUser.id) {
            $('#statistiques .statistique-send-me').html(parseInt($('#statistiques .statistique-send-me').html()) + 1);
        } else {
            $('#statistiques .statistique-send-others').html(parseInt($('#statistiques .statistique-send-others').html()) + 1);
        }
        $('#statistiques .statistique-send-total').html(parseInt($('#statistiques .statistique-send-total').html()) + 1);
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

function deleteMessage() {
    let idMessage = $(currentTarget).data('id');
    socket.emit('deleteMessage', currentConversation, idMessage);
}

function addReaction(reaction, idReaction) {
    let idMessage = $(currentTarget).data('id');
    socket.emit('addReaction', currentConversation, currentUser, idMessage, reaction, idReaction);
}

function addNotifConversation(message) {
    console.log($('.nav__item[data-id="' + message.idConversation + '"] .conversation-link__element__badge .badge'));
    if ($('.nav__item[data-id="' + message.idConversation + '"] .conversation-link__element__badge .badge').length > 0) {
        let badge = $('.nav__item[data-id="' + message.idConversation + '"] .conversation-link__element__badge .badge');
        badge.html(parseInt(badge.html()) + 1);
    } else {
        let newBadge = `
            <span class="badge">1</span>
        `;
        $('.nav__item[data-id="' + message.idConversation + '"] .conversation-link__element__badge').append(newBadge);
        $('.nav__item[data-id="' + message.idConversation + '"] .conversation-link').addClass('conversation-link--unread');
    }
}