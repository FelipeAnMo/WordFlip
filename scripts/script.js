$(document).ready(async () => {
    let executed = false;
    let randomWord = await getRandomWord();

    const languageStorage = localStorage.getItem('language');
    const flags = {
        Portuguese: 'https://flagpedia.net/data/flags/h24/br.webp',
        Spanish: 'https://flagpedia.net/data/flags/h24/es.webp',
        German: 'https://flagpedia.net/data/flags/h24/de.webp',
        French: 'https://flagpedia.net/data/flags/h24/fr.webp',
        Russian: 'https://flagpedia.net/data/flags/h24/ru.webp'
    };
        
    if(languageStorage !== null) {
        $('#language-selected').attr('data-name', languageStorage);
        
        if (flags.hasOwnProperty(languageStorage)) {
            $('#language-selected > img').attr('src', flags[languageStorage]);
        }
    } else {
        $('#language-selected').attr('data-name', 'Portuguese');
        $('#language-selected > img').attr('src', 'https://flagpedia.net/data/flags/h24/br.webp');
    }

    async function loadWordlist() {
        try {
            const response = await fetch('wordlist/wordlist.txt');
            if (!response.ok) throw new Error('Erro ao carregar o arquivo de texto');

            const text = await response.text();
            return text.split('\n').map(word => word.trim()).filter(word => word.length > 0);
        } catch (error) {
            console.error('Erro:', error);
            return [];
        }
    }

    async function getRandomWord() {
        const words = await loadWordlist();
        if (words.length === 0) return null;

        const randomIndex = Math.floor(Math.random() * words.length);
        const word = words[randomIndex];
        return word.charAt(0).toUpperCase() + word.slice(1);
    }

    async function main(language) {
        if (!randomWord)  {
            randomWord = await getRandomWord();
        };

        console.log('Palavra aleatória:', randomWord);

        const var1 = randomWord.padEnd(1, '_').slice(0, 1).toLowerCase();
        const var2 = randomWord.padEnd(3, '_').slice(0, 3).toLowerCase();
        const var3 = randomWord.padEnd(5, '_').slice(0, 5).toLowerCase();

        language = language || $('#language-selected').attr('data-name');
        console.log('Idioma:', language);

        $('#wordAudio').attr('src', `https://dictionary.cambridge.org/media/english/us_pron/${var1}/${var2}/${var3}/${randomWord.toLowerCase()}.mp3`);

        if ($('.card-head-word').text() !== "") {
            setTimeout(() => {
                $('.card-head-word').text(randomWord);
            }, 750);
        } else {
            $('.card-head-word').text(randomWord);
            setTimeout(() => {
                $('.card-head-content').removeClass('fadeIn');
            }, 750);
        }

        puter.ai.chat(`Very briefly and simply, what does '${randomWord}' mean? Please show the words in English and ${language} side by side and the answer in ${language}. Here is the template: (English - IPA) - ${language} translate: Answer`)
            .then(response => {
                if (randomWord === $('.card-head-word').text()) {
                    $('.card-body-bottom').text(response);
                    $('.card-body-loading').css('display', 'none');
                }
            });
    }

    $('#btn-reload').on('click', async function () {
        randomWord = await getRandomWord();

        if (!executed) {
            executed = true;
            $('.card-body-loading').css('display', 'flex');
            $('#btn-reload').addClass('reload');
            $('.card-head-content').addClass('fadeInOutIn');

            await main();

            setTimeout(() => {
                $('#btn-reload').removeClass('reload');
                $('.card-head-content').removeClass('fadeInOutIn');
                executed = false;
            }, 1500);
        }
    });

    $('#btn-audio').on('click', function () {
        const audio = $('#wordAudio')[0];
        if (!audio.paused) audio.currentTime = 0;
        audio.play();
    });

    $('#btn-select-language').on('click', function () {
        const modal = $('.box-more-languages');
        const icon = $('#btn-select-language div > i');

        if (modal.css('height') === '0px') {
            modal.css({ 
                height: '162px', 
                border: '1px solid #ccc', 
                borderTop: '0px solid #ccc',
                background: '#dadada'
            });
            icon.css('transform', 'rotate(-90deg)');

            $(this).css('border-radius', '6px 6px 6px 0px');
        } else {
            icon.css('transform', 'rotate(0deg)');
            
            modal.css('height', '0px');
            setTimeout(() => {
                modal.css({
                    background: 'transparent',
                    border: '1px solid transparent'
                });

                $(this).css('border-radius', '6px');
            }, 400);
        }
    });

    $('.select-language').on('click', function () {
        const imageSource = $(this).find('img').attr('src');
        const language = $(this).data('name');

        $('#language-selected > img').attr('src', imageSource);
        $('#language-selected').attr('data-name', language);

        $('.card-body-loading').css('display', 'flex');

        localStorage.setItem('language', language);

        main();
    });

    await main();

    $('#btn-show-word').on('click', function () {
        alert('Palavra atual: ' + randomWord);
    });
});
