#include <QtCore/QUrl>
#include <QtCore/QCommandLineOption>
#include <QtCore/QCommandLineParser>
#include <QGuiApplication>
#include <QStyleHints>
#include <QScreen>
#include <QQmlApplicationEngine>
#include <QtQml/QQmlContext>
#include <QtWebView/QtWebView>

using namespace Qt::StringLiterals;

// Workaround: As of Qt 5.4 QtQuick does not expose QUrl::fromUserInput.
class Utils : public QObject
{
    Q_OBJECT
public:
    using QObject::QObject;

    Q_INVOKABLE static QUrl fromUserInput(const QString &userInput);
};

// Fallback data: URL that just renders "An error occurred"
constexpr auto fallbackUrl = "data:text/html,<!DOCTYPE html><html lang=\"en\"><head><meta charset=\"UTF-8\"><title>Error</title></head><body><h1 style=\"color: red; text-align: center;\">An error occurred</h1><p style=\"text-align: center;\">Please report this issue.</p></body></html>"_L1;

QUrl Utils::fromUserInput(const QString &userInput)
{
    if (!userInput.isEmpty())
    {
        if (const QUrl result = QUrl::fromUserInput(userInput); result.isValid())
            return result;
    }
    return QUrl::fromUserInput(fallbackUrl);
}

#include "main.moc"

int main(int argc, char *argv[])
{
    QtWebView::initialize();
    QGuiApplication app(argc, argv);
    QGuiApplication::setApplicationDisplayName(QCoreApplication::translate("main",
                                                                           "RomM Sync"));
    QCommandLineParser parser;
    QCoreApplication::setApplicationVersion(QT_VERSION_STR);
    parser.setApplicationDescription(QGuiApplication::applicationDisplayName());
    parser.addHelpOption();
    parser.addVersionOption();
    parser.addPositionalArgument("url"_L1, "The initial URL to open."_L1);
    parser.process(QCoreApplication::arguments());
    const QString initialUrl = parser.positionalArguments().value(0, fallbackUrl);

    QQmlApplicationEngine engine;
    QQmlContext *context = engine.rootContext();
    context->setContextProperty("utils"_L1, new Utils(&engine));
    context->setContextProperty("initialUrl"_L1,
                                Utils::fromUserInput(initialUrl));

    QRect geometry = QGuiApplication::primaryScreen()->availableGeometry();
    // Allow resizing: do not force a fixed size, just provide a default window size and position
    const QSize defaultSize = geometry.size() * 4 / 5;
    const QSize offset = (geometry.size() - defaultSize) / 2;
    const QPoint pos = geometry.topLeft() + QPoint(offset.width(), offset.height());
    geometry = QRect(pos, defaultSize);

    engine.setInitialProperties(QVariantMap{
        {"x"_L1, geometry.x()},
        {"y"_L1, geometry.y()},
        {"width"_L1, geometry.width()},
        {"height"_L1, geometry.height()},
        {"resizable"_L1, true} // Pass a flag to QML to allow resizing
    });

    engine.load(QUrl("qrc:/main.qml"_L1));
    if (engine.rootObjects().isEmpty())
        return -1;

    return app.exec();
}
