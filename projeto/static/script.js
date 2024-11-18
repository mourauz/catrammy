document.addEventListener("DOMContentLoaded", function() {
  function mudarFundo(imagem) {
    document.body.style.backgroundImage = `url('${imagem}')`;
    document.body.style.backgroundSize = 'cover';
    document.body.style.backgroundPosition = 'center';
  }

  document.getElementById('login-btn')?.addEventListener('click', function(e) {
    e.preventDefault();
    mudarFundo('/static/imagens/mucei.jpg');
    setTimeout(() => {
      window.location.href = "{{ url_for('login') }}";
    }, 100);
  });

  document.getElementById('cadastro-btn')?.addEventListener('click', function(e) {
    e.preventDefault();
    mudarFundo('/static/imagens/gatozoiudo.jpg');
    setTimeout(() => {
      window.location.href = "{{ url_for('register') }}";
    }, 100);
  });

  document.getElementById('login-form').addEventListener('submit', async function(event) {
    event.preventDefault(); 
  
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
  
    try {
      const response = await fetch('/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
  
      const data = await response.json();
      
      if (data.success) {
        window.location.href = '/vote'; // Redireciona para a página de votação
      } else {
        const errorMessage = document.getElementById('error-message');
        errorMessage.style.display = 'block';
        errorMessage.textContent = data.message;
      }
    } catch (error) {
      console.error('Erro:', error);
      alert('Erro de conexão, tente novamente.');
    }
  });
  

  document.getElementById('register-form')?.addEventListener('submit', async function(event) {
    event.preventDefault();
  
    const username = document.getElementById('new-username').value;
    const email = document.getElementById('new-email').value;
    const password = document.getElementById('new-password').value;
  
    try {
      const response = await fetch('/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password })
      });
  
      const data = await response.json();
  
      if (data.success) {
        alert("Cadastro realizado com sucesso!");
        window.location.href = "{{ url_for('login') }}"; // Redireciona para login
      } else {
        document.getElementById('message').textContent = data.message || "Erro ao cadastrar. Tente novamente.";
        document.getElementById('message').style.color = 'red';
      }
    } catch (error) {
      console.error('Erro:', error);
      alert('Erro de conexão.');
    }
  });
  

  document.getElementById('vote-form')?.addEventListener('submit', function(event) {
    event.preventDefault();
    const singer = document.getElementById("singer").value;
    const song = document.getElementById("song").value;
    const genre = document.getElementById("genre").value;
    const birthyear = parseInt(document.getElementById("birthyear").value);

    const currentYear = new Date().getFullYear();
    const avgAge = currentYear - birthyear;

    document.getElementById("fav-song").textContent = song;
    document.getElementById("fav-singer").textContent = singer;
    document.getElementById("fav-genre").textContent = genre;
    document.getElementById("avg-age").textContent = avgAge + " anos";

    document.getElementById("results-section").style.display = "block";
  });

  document.addEventListener('scroll', function() {
    const infoSection = document.querySelector('.informacoes');
    const position = infoSection.getBoundingClientRect();

    if (position.top <= window.innerHeight && position.bottom >= 0) {
      infoSection.classList.add('visible');
    }
  });
});

document.addEventListener("DOMContentLoaded", function() {
  const voteButtons = document.querySelectorAll(".vote-btn");

  voteButtons.forEach(button => {
    button.addEventListener("click", () => {
      const artist = button.getAttribute("data-artist");
      alert(`Você votou em ${artist}!`);

      // Exibe a mensagem de agradecimento
      document.querySelector("#thanks-message").style.display = "block";

      // Opcional: Enviar voto para o servidor
      fetch('/vote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ artist })
      })
        .then(response => response.json())
        .then(data => console.log(data))
        .catch(error => console.error('Erro ao enviar voto:', error));
    });
  });
});


