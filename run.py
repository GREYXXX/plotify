from plotify import webapp

if __name__ == "__main__":
    import waitress

    waitress.serve(
        webapp,
        host="0.0.0.0",
        port=8080,
    )
