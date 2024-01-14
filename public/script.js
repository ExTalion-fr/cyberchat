const socket = io();

window.addEventListener('DOMContentLoaded', () => {
    console.log('DOM chargé');
    console.log(Cookies.get('username'));
    if (Cookies.get('username') !== undefined) {
        document.querySelector('#username').value = Cookies.get('username');
    } else {
        showLogin();
    }

    // Sign

    $("#signUp").click(function() {
        console.log("click");
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

});

function showLogin() {
    $('.status-success').hide(1);
	$('.status-error').hide(1);

    $('.terminal').addClass('hidden');

    const connexionButton = document.getElementById("connexionButton");
	const inscriptionButton = document.getElementById("inscriptionButton");
    const contentSign = document.getElementById("content-sign");

    // connexionButton.addEventListener("click", function() {
	// 	let email = document.getElementById("email").value;
	// 	let motDePasse = document.getElementById("motDePasse").value;
	// 	let resultAjax = "";
	// 	if(email.length < 80 && email.length >= 8 && email.indexOf("@") != -1) {
	// 		if(motDePasse.length < 30 && motDePasse.length >= 8) {
	// 			$.ajax({url:"sign.php?ajax=true&connexion=true&email=" + email + "&motDePasse=" + motDePasse, success:function(result){
	// 				console.log(result);
	// 				if(result == "true") {
	// 					contentSign.classList.add("hidden");
	// 					launchReboot(save);
	// 				} else {
	// 					alertError.innerHTML = "Votre email ou votre mot de passe n'est pas bon !";
	// 					$(".status-error").show(500);
	// 				}
	// 			}});
	// 		} else {
	// 			alertError.innerHTML = "Votre mot de passe doit contenir entre 8 et 30 caractères !";
	// 			$(".status-error").show(500);
	// 		}
	// 	} else {
	// 		alertError.innerHTML = "Veuillez rentrer votre email !";
	// 		$(".status-error").show(500);
	// 	}	
    // })

	// inscriptionButton.addEventListener("click", function() {
	// 	let newPseudo = document.getElementById("newPseudo").value;
	// 	let newEmail = document.getElementById("newEmail").value;
	// 	let newMotDePasse = document.getElementById("newMotDePasse").value;
	// 	if(newPseudo.length < 30 && newPseudo.length >= 4) {
	// 		if(newEmail.length < 80 && newEmail.length >= 8 && newEmail.indexOf("@") != -1) {
	// 			if(newMotDePasse.length < 30 && newMotDePasse.length >= 8) {
	// 				$.ajax({url:"sign.php?ajax=true&newPseudo=" + newPseudo + "&newEmail=" + newEmail + "&newMotDePasse=" + newMotDePasse,});
	// 				document.getElementById("form1").reset();
	// 				alertSuccess.innerHTML = "Vous avez bien été inscrit !";
	// 				$(".status-success").show(500);
	// 			} else {
	// 				alertError.innerHTML = "Votre mot de passe doit contenir entre 8 et 30 caractères !";
	// 				$(".status-error").show(500);
	// 			}
	// 		} else {
	// 			alertError.innerHTML = "Votre email doit être valide !";
	// 			$(".status-error").show(500);
	// 		}
	// 	} else {
	// 		alertError.innerHTML = "Votre pseudo doit contenir entre 4 et 30 caractères !";
	// 		$(".status-error").show(500);
	// 	}
    // })
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
				console.clear();
				appActive();
			}, 1500);
        });
    };

    PlayHydra();
}

function appActive() {
	var user = {};
	const navDirect = document.getElementById("nav-direct");
	const channelBody = document.querySelector("div.channel-feed__body");
	const channelAuthorName = document.querySelector("div.segment-topbar span.channel-link__element");
	const sendButton = document.getElementById("sendButton");

	navDirectUpdate(navDirect, channelBody, channelAuthorName);

	let xmlHttpRequest = new XMLHttpRequest();
	xmlHttpRequest.addEventListener('readystatechange', function() {
		if (xmlHttpRequest.readyState == 4) {
			if (xmlHttpRequest.status == 200) {
				let resultat = xmlHttpRequest.responseText;
				let session = resultat.split('/');
				var id = session[0];
				var nom = session[1];
				var email = session[2];
				user = {"id" : id , "nom" : nom, "email" : email};
				const appHeaderAnchorText = document.querySelector("div.app-header__anchor").lastElementChild.innerHTML += user['nom'];
			}
		}
	});
	xmlHttpRequest.open("GET", "./sign.php?ajax=true&getSession=true", true);
	xmlHttpRequest.send(null);

    for(const elt of document.getElementsByClassName("nav__item__header")) {
        elt.addEventListener("click", function() {            
            for(const eltPrev of document.getElementsByClassName("nav__item__header")) {
                if(eltPrev.firstElementChild.classList.length > 1) {
                    eltPrev.firstElementChild.classList.toggle("nav__link--active");
                }
            }
            elt.firstElementChild.classList.add("nav__link--active");
        });
	}

	document.getElementById("deconnexionButton").addEventListener("click", function () { 
		$.ajax({url:"sign.php?ajax=true&deconnexion=true", success:function(result){
			window.location.reload();
		}});
	});

	document.getElementById("add-author-message").addEventListener("click", function() { 
		navLinkFalse();
		channelAuthorName.innerHTML = "Créer une conversation";
		$.ajax({url:"ajax.php?section=authorlist", success:function(result){
			channelBody.innerHTML = result;
			for(const elt of document.getElementsByClassName("author-list-button-message")) {
				elt.addEventListener("click", function() {
					let idAuthor = elt.previousElementSibling.lastElementChild.id;
					let nomAuthor = elt.previousElementSibling.lastElementChild.innerHTML;
					$.ajax({url:"ajax.php?section=addauthorlist&idauthor=" + idAuthor, success:function(result){
						navDirectUpdate(navDirect, channelBody, channelAuthorName);
						messageUpdate(idAuthor, nomAuthor, channelBody, channelAuthorName);
					}});
				});
			}
		}});
	});

	sendButton.addEventListener("click", function() {
		for(const elt of document.getElementsByClassName("nav__item")) {
			if(elt.classList.contains("selected")) {
				var idAuthor = elt.id;
				var nomAuthor = elt.firstElementChild.firstElementChild.lastElementChild.innerHTML;
			}
		}
		let messageContent = document.getElementById("message").value;
		$.ajax({url:"ajax.php?section=addmessage&idauthor=" + idAuthor + "&messagecontent=" + messageContent, success:function(result) {
			document.getElementById("message").value = "";
			// navDirectUpdate(navDirect, channelBody, channelAuthorName);
			messageUpdate(idAuthor, nomAuthor, channelBody, channelAuthorName);
		}});
	})
}