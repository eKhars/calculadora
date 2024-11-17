# TreeCalc 🌳🔢

![image](https://github.com/user-attachments/assets/9644d840-8b2e-4b7c-8d18-e9b7062e53fe)

## Descripción
TreeCalc es una aplicación web moderna que combina una calculadora interactiva con visualización de árboles sintácticos en tiempo real. Utilizando gramática libre de contexto, parsea expresiones matemáticas y genera una representación visual del árbol de operaciones, facilitando la comprensión de la precedencia y estructura de las operaciones matemáticas.

## Características ✨
- Interfaz de calculadora moderna y responsive
- Visualización de árboles sintácticos en tiempo real
- Soporte para operaciones básicas (+, -, *, /)
- Manejo de paréntesis para control de precedencia
- Animaciones fluidas en la interfaz y generación de árboles
- Diseño adaptable a diferentes tamaños de pantalla

## Tecnologías Utilizadas 🛠️
- **Backend**:
  - Python 3.x
  - Flask
  - Gramática Libre de Contexto para parsing

- **Frontend**:
  - HTML5
  - CSS3 con animaciones
  - JavaScript
  - D3.js para visualización de árboles

## Instalación 🚀

1. Clona el repositorio:
```bash
git clone https://github.com/betooxx-dev/treecalc.git
cd treecalc
```

2. Crea y activa un entorno virtual:
```bash
python -m venv venv
source venv/bin/activate  # En Windows: venv\Scripts\activate
```

3. Instala las dependencias:
```bash
pip install Flask
```

4. Ejecuta la aplicación:
```bash
python app.py
```

5. Abre tu navegador y visita:
```
http://localhost:5000
```

## Estructura del Proyecto 📁
```
treecalc/
├── app.py             # Aplicación principal Flask
├── templates/
│   ├── index.html    # Plantilla principal
│   ├── index.css     # Estilos
│   └── index.js      # Lógica del cliente
└── README.md         # Documentación
```

## Uso 💡
1. Ingresa una expresión matemática usando la calculadora
2. Los resultados se muestran instantáneamente
3. El árbol sintáctico se genera y anima en tiempo real
4. Puedes usar paréntesis para agrupar operaciones
5. La visualización se adapta automáticamente al tamaño de la ventana

## Ejemplos de Expresiones 📝
- Operaciones básicas: `3 + 4 * 2`
- Con paréntesis: `(3 + 4) * 2`
- Operaciones múltiples: `5 * (3 + 2) / 4`
