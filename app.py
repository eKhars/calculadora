from flask import Flask, render_template, jsonify, request, send_from_directory
import ply.lex as lex
import re
import os

app = Flask(__name__)

# Almacenamiento de memoria
stored_result = None

# Definición de tokens en español
tokens = [
    'NUMERO',
    'SUMA',
    'RESTA',
    'MULTIPLICACION',
    'DIVISION',
    'PARENTESIS_IZQ',
    'PARENTESIS_DER',
    'DECIMAL'
]

# Reglas de tokens
t_SUMA    = r'\+'
t_RESTA   = r'-'
t_MULTIPLICACION   = r'\*'
t_DIVISION  = r'/'
t_PARENTESIS_IZQ  = r'\('
t_PARENTESIS_DER  = r'\)'
t_DECIMAL = r'\.'

def t_NUMERO(t):
    r'\d+'
    t.value = float(t.value)
    return t

t_ignore = ' \t'

def t_error(t):
    print(f"Carácter ilegal '{t.value[0]}'")
    t.lexer.skip(1)

# Construir lexer
lexer = lex.lex()

class Node:
    def __init__(self, value):
        self.value = value
        self.left = None
        self.right = None

def tokenize_expression(expression):
    lexer.input(expression)
    tokens_list = []
    token_counts = {
        'numeros': 0,
        'operadores': 0
    }
    
    while True:
        tok = lexer.token()
        if not tok:
            break
        tokens_list.append(tok)
        if tok.type == 'NUMERO':
            token_counts['numeros'] += 1
        elif tok.type in ['SUMA', 'RESTA', 'MULTIPLICACION', 'DIVISION']:
            token_counts['operadores'] += 1
    
    return tokens_list, token_counts

def build_tree(expression):
    expression = expression.replace(' ', '')
    if not re.match(r'^[0-9+\-*/().]+$', expression):
        return None
    
    def find_main_operator(expr):
        parentheses = 0
        for i in range(len(expr)-1, -1, -1):
            if expr[i] == ')':
                parentheses += 1
            elif expr[i] == '(':
                parentheses -= 1
            elif parentheses == 0 and expr[i] in '+-*/':
                return i
        return -1

    while expression.startswith('(') and expression.endswith(')'):
        expression = expression[1:-1]

    op_index = find_main_operator(expression)
    
    if op_index == -1:
        try:
            return Node(float(expression))
        except ValueError:
            return None

    root = Node(expression[op_index])
    
    root.left = build_tree(expression[:op_index])
    root.right = build_tree(expression[op_index + 1:])
    
    return root

def tree_to_dict(node):
    if node is None:
        return None
    return {
        'value': str(node.value),
        'children': [
            tree_to_dict(node.left),
            tree_to_dict(node.right)
        ] if (node.left or node.right) else None
    }

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/<path:filename>')
def serve_static(filename):
    return send_from_directory('templates', filename)

@app.route('/calculate', methods=['POST'])
def calculate():
    expression = request.json.get('expression', '')
    try:
        tokens_list, token_counts = tokenize_expression(expression)
        tree = build_tree(expression)
        tree_dict = tree_to_dict(tree)
        result = eval(expression)
        
        # Convertir los tipos de tokens a español
        token_translations = {
            'NUMERO': 'Número',
            'SUMA': 'Suma',
            'RESTA': 'Resta',
            'MULTIPLICACION': 'Multiplicación',
            'DIVISION': 'División',
            'PARENTESIS_IZQ': 'Paréntesis Izquierdo',
            'PARENTESIS_DER': 'Paréntesis Derecho',
            'DECIMAL': 'Punto Decimal'
        }
        
        tokens_spanish = [{
            'tipo': token_translations.get(tok.type, tok.type),
            'valor': tok.value
        } for tok in tokens_list]
        
        return jsonify({
            'resultado': result,
            'arbol': tree_dict,
            'tokens': tokens_spanish,
            'conteo_tokens': {
                'numeros': token_counts['numeros'],
                'operadores': token_counts['operadores']
            }
        })
    except Exception as e:
        print(f"Error: {str(e)}")
        return jsonify({'error': 'Expresión inválida'}), 400

@app.route('/memory', methods=['POST'])
def memory_operations():
    global stored_result
    operation = request.json.get('operation')
    value = request.json.get('value')
    
    if operation == 'MS':
        stored_result = value
        return jsonify({'status': 'guardado'})
    elif operation == 'MR':
        return jsonify({'value': stored_result if stored_result is not None else 0})
    
    return jsonify({'error': 'Operación inválida'}), 400

if __name__ == '__main__':
    app.run(debug=True)