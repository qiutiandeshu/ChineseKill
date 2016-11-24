#ifndef AIENGINE_H_
#define AIENGINE_H_

#define AIENGINE_VERSION "1.4.2"

#if (!(defined AIENGINE_CALL) || !(defined AIENGINE_IMPORT_OR_EXPORT))
#    if defined __WIN32__ || defined _WIN32 || defined _WIN64
#       define AIENGINE_CALL __stdcall
#       ifdef  AIENGINE_IMPLEMENTION
#           define AIENGINE_IMPORT_OR_EXPORT __declspec(dllexport)
#       else
#           define AIENGINE_IMPORT_OR_EXPORT __declspec(dllimport)
#       endif
#    else
#       define AIENGINE_CALL
#       define AIENGINE_IMPORT_OR_EXPORT
#    endif
#endif

#ifdef __cplusplus
extern "C" {
#endif

enum {
    AIENGINE_MESSAGE_TYPE_JSON = 1,
    AIENGINE_MESSAGE_TYPE_BIN
};

enum {
    AIENGINE_OPT_INVALID  = 0,
    AIENGINE_OPT_GET_VERSION,
    AIENGINE_OPT_GET_MODULES,
    AIENGINE_OPT_GET_TRAFFIC,
    AIENGINE_OPT_MAX
};

struct aiengine;

typedef int (AIENGINE_CALL *aiengine_callback)(const void *usrdata, const char *id, int type, const void *message, int size);
AIENGINE_IMPORT_OR_EXPORT struct aiengine * AIENGINE_CALL aiengine_new(const char *cfg);
AIENGINE_IMPORT_OR_EXPORT int AIENGINE_CALL aiengine_delete(struct aiengine *engine);
AIENGINE_IMPORT_OR_EXPORT int AIENGINE_CALL aiengine_start(struct aiengine *engine, const char *param, char id[64], aiengine_callback callback, const void *usrdata);
AIENGINE_IMPORT_OR_EXPORT int AIENGINE_CALL aiengine_feed(struct aiengine *engine, const void *data, int size);
AIENGINE_IMPORT_OR_EXPORT int AIENGINE_CALL aiengine_stop(struct aiengine *engine);
AIENGINE_IMPORT_OR_EXPORT int AIENGINE_CALL aiengine_log(struct aiengine *engine, const char *log);
AIENGINE_IMPORT_OR_EXPORT int AIENGINE_CALL aiengine_get_device_id(char device_id[64]);
AIENGINE_IMPORT_OR_EXPORT int AIENGINE_CALL aiengine_cancel(struct aiengine *engine);
AIENGINE_IMPORT_OR_EXPORT int AIENGINE_CALL aiengine_opt(struct aiengine *engine, int opt, char *data, int size);

#ifdef __cplusplus
}
#endif
#endif
