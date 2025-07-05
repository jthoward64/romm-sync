cmake_minimum_required(VERSION 3.19)
project(romm-sync-webview LANGUAGES CXX)

set(CMAKE_AUTOMOC ON)

find_package(Qt6 6.5 REQUIRED COMPONENTS Core Gui Qml Quick WebView)

qt_standard_project_setup()

qt_add_executable(romm-sync-webview
    main.cpp
)

target_link_libraries(romm-sync-webview
    PRIVATE
        Qt::Core
        Qt6::Gui
        Qt::Qml
        Qt6::Quick
        Qt6::WebView
)

set(qml_resource_files
    "main.qml"
)

qt6_add_resources(romm-sync-webview "qml"
    PREFIX "/"
    FILES ${qml_resource_files}
)

install(TARGETS romm-sync-webview
    BUNDLE  DESTINATION .
    RUNTIME DESTINATION ${CMAKE_INSTALL_BINDIR}
    LIBRARY DESTINATION ${CMAKE_INSTALL_LIBDIR}
)

qt_generate_deploy_app_script(
    TARGET romm-sync-webview
    OUTPUT_SCRIPT deploy_script
    NO_UNSUPPORTED_PLATFORM_ERROR
)

install(SCRIPT ${deploy_script})
