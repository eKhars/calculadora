from flask import Flask, render_template, jsonify, request, send_from_directory
import re
import os

app = Flask(__name__)

class Node:
    def __init__(self, value):
        self.value = value
        self.left = None
        self.right = None

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
        tree = build_tree(expression)
        tree_dict = tree_to_dict(tree)
        result = eval(expression)
        return jsonify({
            'result': result,
            'tree': tree_dict
        })
    except Exception as e:
        print(f"Error: {str(e)}")
        return jsonify({'error': 'Invalid expression'}), 400

if __name__ == '__main__':
    app.run(debug=True)