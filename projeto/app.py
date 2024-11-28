import os
import bcrypt
from flask import Flask, jsonify, render_template, request, redirect, url_for, session, flash
from flask_sqlalchemy import SQLAlchemy
from datetime import timedelta

app = Flask(__name__, template_folder='templates', static_folder='static')

# Configurações do Flask
app.secret_key = os.getenv('SECRET_KEY', 'chave_super_secreta')  # Definindo chave secreta
app.config['SQLALCHEMY_DATABASE_URI'] = 'mysql+pymysql://gabana:%21%40%23Gab2x22..@127.0.0.1:3306/usuarios_db'
app.config['PERMANENT_SESSION_LIFETIME'] = timedelta(minutes=30)
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# Inicializando SQLAlchemy
db = SQLAlchemy(app)

# Modelos
class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(150), nullable=False, unique=True)
    email = db.Column(db.String(150), nullable=False, unique=True)
    password = db.Column(db.String(255), nullable=False)

class Vote(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    choice = db.Column(db.String(100), nullable=False)
    user = db.relationship('User', backref=db.backref('votes', lazy=True))

# Inicializar banco de dados
with app.app_context():
    db.create_all()

# Rotas
@app.route('/')
def index():
    return render_template('index.html')

@app.route('/register', methods=['GET', 'POST'])
def register():
    if request.method == 'POST':
        username = request.form.get('username')
        email = request.form.get('email')
        password = request.form.get('password')

        if not email or not username or not password:
            flash('Todos os campos são obrigatórios!', 'error')
            return redirect(url_for('register'))

        if User.query.filter_by(username=username).first():
            flash('Usuário já existe!', 'error')
            return redirect(url_for('register'))

        if User.query.filter_by(email=email).first():
            flash('Email já registrado!', 'error')
            return redirect(url_for('register'))

        hashed_password = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
        new_user = User(username=username, email=email, password=hashed_password)

        try:
            db.session.add(new_user)
            db.session.commit()
            flash('Cadastro realizado com sucesso! Por favor, faça login.', 'success')
            return redirect(url_for('login'))
        except Exception as e:
            db.session.rollback()
            flash(f'Erro ao cadastrar usuário: {str(e)}', 'error')
            return redirect(url_for('register'))

    return render_template('register.html')

@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        username = request.form['username']
        password = request.form['password']

        user = User.query.filter_by(username=username).first()
        if user and bcrypt.checkpw(password.encode('utf-8'), user.password.encode('utf-8')):
            session['user_id'] = user.id
            session['username'] = user.username
            flash('Login realizado com sucesso!', 'success')
            return redirect(url_for('vote'))  # Redireciona para a página de votação após o login
        else:
            flash('Usuário ou senha inválidos.', 'error')
            return redirect(url_for('login'))  # Redireciona de volta para login em caso de erro

    return render_template('login.html')

@app.route('/vote', methods=['GET', 'POST'])
def vote():
    if 'user_id' not in session:
        flash('Por favor, faça login para acessar a votação.', 'warning')
        return redirect(url_for('login'))

    # Lista de artistas
    artists = [
        {'name': 'Billie Eilish', 'image': 'billie.png'},
        {'name': 'Travis Scott', 'image': 'travis.jpg'},
        {'name': 'The Weeknd', 'image': 'the_weeknd.jpeg'},
        {'name': 'Tyler, The Creator', 'image': 'tyler.png'},
        {'name': 'Taylor Swift', 'image': 'taylor.jpg'},
        {'name': 'Rihanna', 'image': 'rihanna.jpg'},
        {'name': 'Clairo', 'image': 'clairo.jpg'}
    ]

    if request.method == 'POST':
        choice = request.form.get('choice')
        if not choice:
            flash('Por favor, selecione um artista antes de votar.', 'error')
            return redirect(url_for('vote'))

        valid_choices = [artist['name'] for artist in artists]
        if choice not in valid_choices:
            flash('Escolha inválida.', 'error')
            return redirect(url_for('vote'))

        user_id = session['user_id']
        if Vote.query.filter_by(user_id=user_id).first():
            flash('Você já votou!', 'warning')
            return redirect(url_for('vote_results'))

        new_vote = Vote(user_id=user_id, choice=choice)
        try:
            db.session.add(new_vote)
            db.session.commit()
            flash('Voto registrado com sucesso!', 'success')
            return redirect(url_for('vote_results'))
        except Exception as e:
            db.session.rollback()
            flash('Erro ao registrar o voto. Por favor, tente novamente.', 'error')
            return redirect(url_for('vote'))

    return render_template('vote.html', artists=artists)


@app.route('/album', methods=['GET', 'POST'])
def album():
    if request.method == 'POST':
        # Pega o álbum escolhido
        album_votado = request.form.get('album')
        
        # Aqui você pode fazer algo com o álbum votado, como salvar em um banco de dados
        
        # Após o voto, redireciona para a página de música
        return redirect(url_for('musica'))

    return render_template('album.html')

# Página de música
@app.route('/musica')
def musica():
    return render_template('musica.html')

@app.route('/vote_results')
def vote_results():
    votes = Vote.query.join(User).add_columns(User.username, Vote.choice).all()
    return render_template('vote_results.html', votes=votes)

@app.route('/logout')
def logout():
    session.clear()
    flash('Você foi desconectado', 'info')
    return redirect(url_for('index'))  # redireciona para a página inicial

@app.route('/favicon.ico')
def favicon():
    return redirect(url_for('static', filename='imagens/gato-preto.ico'))

if __name__ == '__main__':
    app.run(debug=True)
