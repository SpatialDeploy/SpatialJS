/**
 * splv_log.h
 * 
 * contains functions/macros for logging
 */

#ifndef SPLV_LOG_H
#define SPLV_LOG_H

#include <stdio.h>

//-------------------------------------------//

//TODO: come up with a proper logging scheme
#define SPLV_LOG_ERROR(msg) printf("SPLV ERROR: %s\n", msg)
#define SPLV_LOG_WARNING(msg) printf("SPLV WARNING: %s\n", msg)

#endif //#ifndef SPLV_LOG_H